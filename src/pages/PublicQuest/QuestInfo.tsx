import { LoadingButton } from "@mui/lab";
import {
  Box,
  Stack,
  Typography,
  Tooltip,
  Chip,
  Badge,
  CircularProgress
} from "@mui/material";
import { addDays } from "date-fns";
import { memo, useEffect, useState } from "react";
import DescriptionIcon from "@mui/icons-material/Description";
import { Quest } from "@aut-labs-private/sdk";
import {
  useApplyForQuestMutation,
  useLazyHasUserCompletedQuestQuery,
  useWithdrawFromAQuestMutation
} from "@api/onboarding.api";
import { useEthers } from "@usedapp/core";
import ErrorDialog from "@components/Dialog/ErrorPopup";
import { useSearchParams } from "react-router-dom";
import InfoIcon from "@mui/icons-material/Info";
import { useConfirmDialog } from "react-mui-confirm";
import { CacheTypes, deleteCache, getCache, updateCache } from "@api/cache.api";
import BetaCountdown from "@components/BetaCountdown";
import { RequiredQueryParams } from "../../api/RequiredQueryParams";

const QuestInfo = ({
  quest,
  hasQuestStarted,
  setAppliedQuestFn
}: {
  quest: Quest;
  setAppliedQuestFn: (state: number) => void;
  hasQuestStarted: boolean;
}) => {
  const [searchParams] = useSearchParams();
  const { account } = useEthers();
  const [appliedQuest, setAppliedQuest] = useState(null);
  const [cache, setCache] = useState(null);
  const confirm = useConfirmDialog();
  const [hasUserCompletedQuest] = useLazyHasUserCompletedQuestQuery();
  const [apply, { isLoading: isApplying, isError, error, reset, isSuccess }] =
    useApplyForQuestMutation();

  const [
    withdraw,
    {
      isLoading: isWithdrawing,
      isError: isWithdrawError,
      error: withdrawError,
      reset: withdrawReset,
      isSuccess: withdrawIsSuccess
    }
  ] = useWithdrawFromAQuestMutation();

  const confimWithdrawal = () =>
    confirm({
      title: "Are you sure you want to withdraw from quest?",
      onConfirm: async () => {
        withdraw({
          onboardingQuestAddress: searchParams.get(
            RequiredQueryParams.OnboardingQuestAddress
          ),
          questId: +searchParams.get(RequiredQueryParams.QuestId)
        });
      }
    });

  useEffect(() => {
    if (withdrawIsSuccess) {
      const start = async () => {
        try {
          await deleteCache(CacheTypes.UserPhases);
          setAppliedQuest(null);
          setAppliedQuestFn(null);
          setCache(null);
          withdrawReset();
        } catch (error) {
          console.log(error);
        }
      };
      start();
    }
  }, [withdrawIsSuccess]);

  useEffect(() => {
    if (isSuccess) {
      const start = async () => {
        try {
          const updatedCache = await updateCache({
            ...(cache || {}),
            cacheKey: CacheTypes.UserPhases,
            address: account,
            questId: +searchParams.get(RequiredQueryParams.QuestId),
            onboardingQuestAddress: searchParams.get(
              RequiredQueryParams.OnboardingQuestAddress
            ),
            daoAddress: searchParams.get(RequiredQueryParams.DaoAddress),
            list: [
              {
                phase: 1,
                status: 1
              },
              {
                phase: 2,
                status: 0
              },
              {
                phase: 3,
                status: 0
              }
            ]
          });
          setAppliedQuest(updatedCache?.questId);
          setAppliedQuestFn(updatedCache?.questId);
          setCache(updatedCache);
          reset();
        } catch (error) {
          console.log(error);
        }
      };
      start();
    }
  }, [isSuccess]);

  useEffect(() => {
    const start = async () => {
      try {
        const cacheResult = await getCache(CacheTypes.UserPhases);
        setAppliedQuest(cacheResult?.questId);
        setAppliedQuestFn(cacheResult?.questId);
        setCache(cacheResult);
        if (
          !!cacheResult?.questId &&
          cacheResult?.questId ===
            +searchParams.get(RequiredQueryParams.QuestId)
        ) {
          hasUserCompletedQuest({
            questId: +searchParams.get(RequiredQueryParams.QuestId),
            userAddress: account,
            onboardingQuestAddress: searchParams.get(
              RequiredQueryParams.OnboardingQuestAddress
            ),
            daoAddress: searchParams.get(RequiredQueryParams.DaoAddress)
          });
        }
      } catch (error) {
        console.log(error);
      }
    };
    start();
  }, []);
  return (
    <>
      <ErrorDialog
        handleClose={() => {
          reset();
          withdrawReset();
        }}
        open={isError || isWithdrawError}
        message={error || withdrawError}
      />
      <Box
        sx={{
          flex: 1,
          boxShadow: 1,
          border: "2px solid",
          borderColor: "divider",
          borderRadius: "16px",
          height: "100%",
          p: 3,
          backgroundColor: "nightBlack.main"
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between"
          }}
        >
          <Stack direction="column">
            <Typography color="white" variant="subtitle1">
              <Stack direction="row" alignItems="center">
                {quest?.metadata?.name}
                <Tooltip title={quest?.metadata?.description}>
                  <DescriptionIcon
                    sx={{
                      color: "offWhite.main",
                      ml: 1
                    }}
                  />
                </Tooltip>
                <Chip
                  sx={{
                    ml: 1
                  }}
                  label={quest.active ? "Active" : "Inactive"}
                  color={quest.active ? "success" : "error"}
                  size="small"
                />
              </Stack>
            </Typography>
            <Typography variant="caption" className="text-secondary">
              Quest
            </Typography>
          </Stack>

          {/* {!hasQuestStarted && (
            
          )} */}
          <>
            {!appliedQuest && (
              <Badge
                badgeContent={
                  <Tooltip title="You can only apply to one quest, but you can withdraw before it starts.">
                    <InfoIcon
                      sx={{
                        fontSize: "16px",
                        color: "white"
                      }}
                    />
                  </Tooltip>
                }
              >
                <LoadingButton
                  onClick={async () => {
                    apply({
                      onboardingQuestAddress: searchParams.get(
                        RequiredQueryParams.OnboardingQuestAddress
                      ),
                      questId: +searchParams.get(RequiredQueryParams.QuestId)
                    });
                  }}
                  disabled={isApplying}
                  loadingIndicator={
                    <Stack direction="row" gap={1} alignItems="center">
                      <CircularProgress size="20px" color="offWhite" />
                    </Stack>
                  }
                  loading={isApplying}
                  size="small"
                  color="primary"
                  variant="contained"
                >
                  Apply for quest
                </LoadingButton>
              </Badge>
            )}
            {appliedQuest ===
              +searchParams.get(RequiredQueryParams.QuestId) && (
              <LoadingButton
                onClick={confimWithdrawal}
                disabled={isWithdrawing}
                loadingIndicator={
                  <Stack direction="row" gap={1} alignItems="center">
                    <CircularProgress size="20px" color="offWhite" />
                  </Stack>
                }
                loading={isWithdrawing}
                size="small"
                color="error"
                variant="contained"
              >
                Withdraw
              </LoadingButton>
            )}
          </>
        </Box>

        <Box
          sx={{
            mt: 2,
            display: "grid",
            gridTemplateColumns: "1fr 2fr"
          }}
        >
          <BetaCountdown
            textAlign="left"
            to={
              hasQuestStarted
                ? addDays(new Date(quest?.startDate), 15)
                : new Date(quest?.startDate)
            }
          />
        </Box>
      </Box>
    </>
  );
};

export default memo(QuestInfo);
