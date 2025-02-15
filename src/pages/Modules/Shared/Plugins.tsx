import { useGetAllPluginDefinitionsByDAOQuery } from "@api/plugin-registry.api";
import {
  Box,
  Button,
  Container,
  FormControlLabel,
  IconButton,
  Stack,
  Switch,
  Tooltip,
  Typography,
  styled
} from "@mui/material";
import { memo, useMemo, useState } from "react";
import PluginCard, { EmptyPluginCard } from "./PluginCard";
import LoadingProgressBar from "@components/LoadingProgressBar";
import { BaseNFTModel } from "@aut-labs/sdk/dist/models/baseNFTModel";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Link, useSearchParams } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AutLoading from "@components/AutLoading";
import { useGetAllOnboardingQuestsQuery } from "@api/onboarding.api";
import { RequiredQueryParams } from "@api/RequiredQueryParams";

const GridBox = styled(Box)(({ theme }) => {
  return {
    boxSizing: "border-box",
    display: "grid",
    gridTemplateColumns: "1fr",
    gridGap: "30px",
    [theme.breakpoints.up("sm")]: {
      gridTemplateColumns: "repeat(2,minmax(0,1fr))"
    },
    [theme.breakpoints.up("lg")]: {
      gridTemplateColumns: "repeat(3,minmax(0,1fr))"
    }
  };
});

interface StackParams {
  definition: BaseNFTModel<any>;
}

const Plugins = ({ definition }: StackParams) => {
  // const isAdmin = useSelector(IsAdmin);
  const [searchParams] = useSearchParams();
  const [showInstalled, setToggleInstalled] = useState(false);
  const { plugins, isLoading, isFetching, refetch } =
    useGetAllPluginDefinitionsByDAOQuery(null, {
      // @ts-ignore
      selectFromResult: ({ data, isLoading, isFetching, refetch }) => ({
        isLoading,
        refetch,
        isFetching,
        plugins: (data || []).filter(
          (p) =>
            p.metadata?.properties?.module?.type ===
            definition?.properties?.module?.type
        )
      })
    });

  const filteredPlugins = useMemo(() => {
    if (!showInstalled) return plugins;
    return plugins.filter((p) => p.pluginAddress);
  }, [showInstalled, plugins]);

  const typeformLink = useMemo(() => {
    if (definition.properties.module.type === "OnboardingStrategy") {
      return "https://autlabs.typeform.com/onboarding";
    }
    return "https://autlabs.typeform.com/tasktype";
  }, [definition]);

  const { quest, isLoading: isLoadingPlugins } = useGetAllOnboardingQuestsQuery(
    searchParams.get(RequiredQueryParams.OnboardingQuestAddress),
    {
      selectFromResult: ({ data, isLoading, isFetching }) => ({
        isLoading: isLoading || isFetching,
        quest: (data || []).find(
          (q) => q.questId === +searchParams.get(RequiredQueryParams.QuestId)
        )
      })
    }
  );

  return (
    <>
      <LoadingProgressBar isLoading={isFetching || isLoadingPlugins} />
      <Container maxWidth="lg" sx={{ py: "20px" }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            position: "relative"
          }}
        >
          <Stack alignItems="center" justifyContent="center">
            {searchParams.get("returnUrl") && (
              <Button
                startIcon={<ArrowBackIcon />}
                color="offWhite"
                sx={{
                  position: "absolute",
                  left: 0
                }}
                to={{
                  pathname: searchParams.get("returnUrl"),
                  search: searchParams.toString()
                }}
                component={Link}
              >
                {searchParams.get("returnUrlLinkName") || "Back"}
              </Button>
            )}
            <Typography textAlign="center" color="white" variant="h3">
              {definition.properties.module.title}
              <Tooltip title="Refresh plugins">
                {/* @ts-ignore */}
                <IconButton
                  size="medium"
                  color="offWhite"
                  component="span"
                  sx={{
                    ml: 1
                  }}
                  disabled={isLoading || isFetching}
                  onClick={refetch}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Typography>

            {/* {quest?.tasksCount === 0 && (
              <Typography
                mt={2}
                textAlign="center"
                color="white"
                variant="body"
              >
                Your Quest is ready to go - add 1 or more tasks to start
                onboarding {quest?.metadata?.name}
              </Typography>
            )} */}
          </Stack>

          {!!plugins?.length && (
            <Box
              sx={{
                display: "flex",
                mt: 4,
                alignItems: "center",
                justifyContent: "flex-end"
              }}
            >
              <FormControlLabel
                sx={{
                  color: "white"
                }}
                onChange={(_, checked) => setToggleInstalled(checked)}
                control={<Switch checked={showInstalled} color="primary" />}
                label="Show installed"
              />
            </Box>
          )}
        </Box>

        {isLoading ? (
          <AutLoading width="130px" height="130px" />
        ) : (
          <>
            <GridBox sx={{ flexGrow: 1, mt: 4 }}>
              {filteredPlugins.map((plugin, index) => (
                <PluginCard
                  isFetching={isFetching}
                  isAdmin={false}
                  key={`modules-plugin-${index}`}
                  plugin={plugin}
                  hasCopyright={definition?.properties?.type === "Task"}
                />
              ))}
              <EmptyPluginCard
                typeformLink={typeformLink}
                type={definition.properties.module.title}
              />
            </GridBox>
          </>
        )}
      </Container>
    </>
  );
};

export default memo(Plugins);
