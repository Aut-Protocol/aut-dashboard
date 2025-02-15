import AutLoading from "@components/AutLoading";
import { StepperButton } from "@components/Stepper";
import { Container, Stack } from "@mui/material";
import { memo, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useParams, useSearchParams } from "react-router-dom";
import TaskDetails from "../Shared/TaskDetails";
// import { RequiredQueryParams } from "@api/RequiredQueryParams";
import { useOAuth } from "@components/Oauth2/oauth2";
import ErrorDialog from "@components/Dialog/ErrorPopup";
import LoadingDialog from "@components/Dialog/LoadingPopup";
import IosShareIcon from "@mui/icons-material/IosShare";
import { useAccount } from "wagmi";

interface PluginParams {
  plugin: any;
}

const JoinDiscordTask = ({ plugin }: PluginParams) => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const params = useParams();
  const { address: userAddress } = useAccount();
  const isAdmin = true;
  const { getAuth } = useOAuth();
  const [joinClicked, setJoinClicked] = useState(false);

  // const { task } = useGetAllTasksQuery(
  //   {
  //     userAddress,
  //     isAdmin
  //   },
  //   {
  //     selectFromResult: ({ data, isLoading, isFetching }) => ({
  //       isLoading: isLoading || isFetching,
  //       task: (data?.tasks || []).find((t) => {
  //         const [pluginType] = location.pathname.split("/").splice(-2);
  //         return (
  //           t.taskId === +params?.taskId
  //           // PluginDefinitionType[pluginType] ===
  //           //   taskTypes[t.taskType].pluginType
  //         );
  //       })
  //     })
  //   }
  // );

  // const [submitJoinDiscordTask, { error, isError, isLoading, reset }] =
  //   useSubmitJoinDiscordTaskMutation();

  // const onSubmit = async () => {
  //   await getAuth(
  //     async (data) => {
  //       const { access_token } = data;

  //       submitJoinDiscordTask({
  //         userAddress,
  //         task,
  //         bearerToken: access_token,
  //         onboardingPluginAddress: searchParams.get(
  //           RequiredQueryParams.OnboardingQuestAddress
  //         )
  //       });
  //     },
  //     () => {
  //       setJoinClicked(false);
  //     }
  //   );
  // };

  const task = null;

  return (
    <Container
      maxWidth="lg"
      sx={{
        py: "30px",
        height: "100%",
        flex: 1,
        display: "flex",
        flexDirection: "column",
        position: "relative"
      }}
    >
      {/* <ErrorDialog handleClose={() => reset()} open={isError} message={error} />
      <LoadingDialog open={isLoading} message="Submitting task..." /> */}

      {task ? (
        <>
          <TaskDetails task={task} />
          <Stack
            direction="column"
            gap={8}
            sx={{
              flex: 1,
              justifyContent: "space-between",
              margin: "0 auto",
              width: {
                xs: "100%",
                sm: "650px",
                xxl: "800px"
              }
            }}
          >
            <Stack
              sx={{
                margin: "0 auto",
                width: {
                  xs: "100%",
                  sm: "400px",
                  xxl: "500px"
                }
              }}
            >
              {isAdmin && (
                <>
                  <StepperButton
                    label="View Invite link"
                    startIcon={<IosShareIcon />}
                    onClick={() => {
                      window.open(
                        task.metadata.properties["inviteUrl"],
                        "_blank"
                      );
                    }}
                    sx={{ width: "250px", margin: "0 auto" }}
                  />
                </>
              )}
              {!isAdmin && (
                <>
                  {/* {joinClicked && (
                    <StepperButton
                      label="Confirm"
                      disabled={task?.status !== TaskStatus.Created}
                      onClick={() => onSubmit()}
                      sx={{ width: "250px", margin: "0 auto" }}
                    />
                  )} */}
                  {/* {!joinClicked && (
                    <StepperButton
                      label="Join"
                      disabled={task?.status !== TaskStatus.Created}
                      startIcon={<IosShareIcon />}
                      onClick={() => {
                        setJoinClicked(true);
                        window.open(
                          task.metadata.properties["inviteUrl"],
                          "_blank"
                        );
                      }}
                      sx={{ width: "250px", margin: "0 auto" }}
                    />
                  )} */}
                </>
              )}

              {/* <Button
                startIcon={<OpenInNewIcon />}
                sx={{
                  textTransform: "uppercase"
                }}
                type="button"
                size="medium"
                color="offWhite"
                disabled={task?.status !== TaskStatus.Created}
                variant="outlined"
                component={Link}
                target="_blank"
                to={(task as any)?.metadata?.properties?.inviteUrl}
                onClick={setButtonClicked}
              >
                Join Discord
              </Button> */}
            </Stack>
            {/* <Box
              sx={{
                width: "100%",
                display: "flex",
                mb: 4,
                justifyContent: {
                  xs: "center",
                  sm: "flex-end"
                }
              }}
            >
              <StepperButton
                label="Confirm"
                disabled={task?.status !== TaskStatus.Created}
                onClick={handleSubmit(onSubmit)}
                sx={{ width: "250px" }}
              />
            </Box> */}
          </Stack>
        </>
      ) : (
        <AutLoading width="130px" height="130px"></AutLoading>
      )}
    </Container>
  );
};

export default memo(JoinDiscordTask);
