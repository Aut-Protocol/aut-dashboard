import { useGetAllTasksPerQuestQuery } from "@api/onboarding.api";
import { PluginDefinition } from "@aut-labs-private/sdk";
import AutLoading from "@components/AutLoading";
import { AutButton } from "@components/buttons";
import ErrorDialog from "@components/Dialog/ErrorPopup";
import LoadingDialog from "@components/Dialog/LoadingPopup";
import { StepperButton } from "@components/Stepper";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  FormHelperText,
  Stack,
  Typography
} from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { IsAdmin } from "@store/Community/community.reducer";
import { memo, useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useSelector } from "react-redux";
import {
  Link,
  useLocation,
  useParams,
  useSearchParams
} from "react-router-dom";
import TaskDetails from "../Shared/TaskDetails";
import { RequiredQueryParams } from "@api/RequiredQueryParams";
import { taskTypes } from "../Shared/Tasks";
import { PluginDefinitionType } from "@aut-labs-private/sdk/dist/models/plugin";
import { TaskStatus } from "@aut-labs-private/sdk/dist/models/task";
import { useEthers } from "@usedapp/core";

interface PluginParams {
  plugin: PluginDefinition;
}

const JoinDiscordTask = ({ plugin }: PluginParams) => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const params = useParams();
  const { account: userAddress } = useEthers();
  const isAdmin = useSelector(IsAdmin);

  const { task, isLoading } = useGetAllTasksPerQuestQuery(
    {
      userAddress,
      pluginAddress: searchParams.get(
        RequiredQueryParams.OnboardingQuestAddress
      ),
      questId: +searchParams.get(RequiredQueryParams.QuestId)
    },
    {
      selectFromResult: ({ data, isLoading, isFetching }) => ({
        isLoading: isLoading || isFetching,
        task: (data || []).find((t) => {
          const [pluginType] = location.pathname.split("/").splice(-2);
          return (
            t.taskId === +params?.taskId &&
            PluginDefinitionType[pluginType] ===
              taskTypes[t.taskType].pluginType
          );
        })
      })
    }
  );

  const isInReadOnlyModel = useMemo(() => {
    return (
      task?.status === TaskStatus.Finished ||
      task?.status === TaskStatus.Submitted ||
      isAdmin
    );
  }, [task, isAdmin]);

  const { control, handleSubmit, getValues, setValue, formState } = useForm({
    mode: "onChange",
    defaultValues: {
      inviteClicked: false
    }
  });
  const values = useWatch({
    name: "inviteClicked",
    control
  });
  const onSubmit = async () => {
    console.log("JoinDiscordTask onSubmit Values: ", values);
    //submit
  };

  const setButtonClicked = () => {
    setValue("inviteClicked", true);
  };

  return (
    <Container
      maxWidth="lg"
      sx={{
        py: 4,
        height: "100%",
        flex: 1,
        display: "flex",
        flexDirection: "column",
        position: "relative"
      }}
    >
      {task ? (
        <>
          <TaskDetails task={task} />

          <Stack
            direction="column"
            gap={4}
            sx={{
              flex: 1,
              justifyContent: "space-between",
              margin: "0 auto",
              width: {
                xs: "100%",
                sm: "400px",
                xxl: "800px"
              }
            }}
          >
            <Card
              sx={{
                bgcolor: "nightBlack.main",
                borderColor: "divider",
                borderRadius: "16px",
                boxShadow: 3
              }}
            >
              <CardContent
                sx={{
                  display: "flex",
                  flexDirection: "column"
                }}
              >
                <Typography
                  color="white"
                  variant="body"
                  textAlign="center"
                  p="20px"
                >
                  {task?.metadata?.description}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center"
                  }}
                >
                  <Button
                    startIcon={<OpenInNewIcon></OpenInNewIcon>}
                    sx={{
                      width: "200px",
                      height: "50px"
                    }}
                    type="button"
                    color="offWhite"
                    variant="outlined"
                    component={Link}
                    target="_blank"
                    to={`https://discord.gg/${
                      (task as any)?.metadata?.properties?.inviteUrl
                    }`}
                    onClick={setButtonClicked}
                  >
                    Join Discord
                  </Button>
                </Box>
              </CardContent>
            </Card>
            <Stack
              sx={{
                margin: "0 auto",
                width: {
                  xs: "100%",
                  sm: "400px",
                  xxl: "800px"
                }
              }}
            >
              <StepperButton
                label="Submit"
                onClick={handleSubmit(onSubmit)}
                disabled={!values}
              />
            </Stack>
          </Stack>
        </>
      ) : (
        <AutLoading></AutLoading>
      )}
    </Container>
  );
};

export default memo(JoinDiscordTask);
