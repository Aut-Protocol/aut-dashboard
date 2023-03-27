import {
  useCreateQuestMutation,
  useCreateTaskPerQuestMutation
} from "@api/onboarding.api";
import { PluginDefinition, Task } from "@aut-labs-private/sdk";
import ErrorDialog from "@components/Dialog/ErrorPopup";
import LoadingDialog from "@components/Dialog/LoadingPopup";
import { FormHelperText } from "@components/Fields";
import { StepperButton } from "@components/Stepper";
import {
  Box,
  Button,
  Container,
  InputAdornment,
  Stack,
  Typography
} from "@mui/material";
import { AutTextField } from "@theme/field-text-styles";
import { pxToRem } from "@utils/text-size";
import { memo } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams
} from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import { dateToUnix } from "@utils/date-format";
import { addMinutes } from "date-fns";
import { countWords } from "@utils/helpers";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { RequiredQueryParams } from "@api/RequiredQueryParams";
import { useSelector } from "react-redux";
import { DiscordLink } from "@store/Community/community.reducer";

const errorTypes = {
  maxWords: `Words cannot be more than 3`,
  maxNameChars: `Characters cannot be more than 24`,
  maxLength: `Characters cannot be more than 280`
};

interface PluginParams {
  plugin: PluginDefinition;
}

const TaskSuccess = ({ pluginId, reset }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  return (
    <Container
      maxWidth="sm"
      sx={{ mt: pxToRem(20), flexGrow: 1, display: "flex" }}
    >
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          my: "auto"
        }}
      >
        <Typography align="center" color="white" variant="h2" component="div">
          Success! Join Discord task has been created and deployed on the
          Blockchain 🎉
        </Typography>

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gridGap: "20px"
          }}
        >
          <Button
            sx={{
              my: pxToRem(50)
            }}
            type="submit"
            startIcon={<AddIcon />}
            variant="outlined"
            size="medium"
            onClick={reset}
            color="offWhite"
          >
            Add another task
          </Button>

          {searchParams.has("returnUrl") && (
            <Button
              sx={{
                my: pxToRem(50)
              }}
              onClick={() => navigate(searchParams.get("returnUrl"))}
              type="submit"
              variant="outlined"
              size="medium"
              color="offWhite"
            >
              {searchParams.get("returnUrlLinkName") || "Go back"}
            </Button>
          )}
        </Box>
      </Box>
    </Container>
  );
};

const endDatetime = new Date();
addMinutes(endDatetime, 45);

const JoinDiscordTasks = ({ plugin }: PluginParams) => {
  const inviteLink = useSelector(DiscordLink);
  const [searchParams] = useSearchParams();
  const { control, handleSubmit, getValues, formState } = useForm({
    mode: "onChange",
    defaultValues: {
      title: "",
      inviteUrl: inviteLink || "",
      description: ""
    }
  });

  const [createTask, { error, isError, isSuccess, data, isLoading, reset }] =
    useCreateTaskPerQuestMutation();

  const onSubmit = async () => {
    const values = getValues();
    createTask({
      onboardingQuestAddress: searchParams.get(
        RequiredQueryParams.OnboardingQuestAddress
      ),
      pluginTokenId: plugin.tokenId,
      questId: +searchParams.get(RequiredQueryParams.QuestId),
      pluginAddress: plugin.pluginAddress,
      task: {
        role: 1,
        metadata: {
          name: values.title,
          description: values.description,
          properties: {
            inviteUrl: values.inviteUrl
          }
        },
        startDate: dateToUnix(new Date()),
        endDate: dateToUnix(endDatetime)
      } as unknown as Task
    });
  };

  return (
    <>
      {isSuccess ? (
        <TaskSuccess reset={reset} pluginId={data?.taskId} />
      ) : (
        <Container
          sx={{ py: "20px", display: "flex", flexDirection: "column" }}
          maxWidth="lg"
          component="form"
          autoComplete="off"
          onSubmit={handleSubmit(onSubmit)}
        >
          <ErrorDialog
            handleClose={() => reset()}
            open={isError}
            message={error}
          />
          <LoadingDialog open={isLoading} message="Creating task..." />

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              mb: 4,
              position: "relative",
              mx: "auto",
              width: "100%"
            }}
          >
            <Stack alignItems="center" justifyContent="center">
              <Button
                startIcon={<ArrowBackIcon />}
                color="offWhite"
                sx={{
                  position: {
                    sm: "absolute"
                  },
                  left: {
                    sm: "0"
                  }
                }}
                to={searchParams.get("returnUrl")}
                component={Link}
              >
                {searchParams.get("returnUrlLinkName") || "Back"}
              </Button>
              <Typography textAlign="center" color="white" variant="h3">
                Creating Join Discord task
              </Typography>
            </Stack>

            <Typography
              className="text-secondary"
              mt={2}
              mx="auto"
              textAlign="center"
              color="white"
              sx={{
                width: {
                  xs: "100%",
                  sm: "600px",
                  xxl: "800px"
                }
              }}
              variant="body1"
            >
              Ask your community to Join your Discord Community.
            </Typography>
          </Box>
          <Stack
            direction="column"
            gap={4}
            sx={{
              margin: "0 auto",
              width: {
                xs: "100%",
                sm: "400px",
                xxl: "800px"
              }
            }}
          >
            <Controller
              name="title"
              control={control}
              rules={{
                required: true,
                validate: {
                  maxWords: (v: string) => countWords(v) <= 6
                }
              }}
              render={({ field: { name, value, onChange } }) => {
                return (
                  <AutTextField
                    variant="standard"
                    color="offWhite"
                    required
                    autoFocus
                    name={name}
                    value={value || ""}
                    onChange={onChange}
                    placeholder="Title"
                    helperText={
                      <FormHelperText
                        errorTypes={errorTypes}
                        value={value}
                        name={name}
                        errors={formState.errors}
                      />
                    }
                  />
                );
              }}
            />

            <Controller
              name="description"
              control={control}
              rules={{
                required: true
              }}
              render={({ field: { name, value, onChange } }) => {
                return (
                  <AutTextField
                    name={name}
                    value={value || ""}
                    onChange={onChange}
                    variant="outlined"
                    color="offWhite"
                    required
                    multiline
                    rows={5}
                    placeholder="Write a personalised message to your community asking them to join your community."
                    helperText={
                      <FormHelperText
                        errorTypes={errorTypes}
                        value={value}
                        name={name}
                        errors={formState.errors}
                      />
                    }
                  />
                );
              }}
            />

            <Controller
              name="inviteUrl"
              control={control}
              rules={{
                required: true,
                validate: {
                  maxNameChars: (v) => v.length <= 24
                }
              }}
              render={({ field: { name, value, onChange } }) => {
                return (
                  <AutTextField
                    variant="standard"
                    color="offWhite"
                    required
                    name={name}
                    value={value || ""}
                    onChange={onChange}
                    placeholder="1234"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <p
                            style={{
                              color: "white",
                              marginRight: "-5px"
                            }}
                          >
                            https://discord.com/invite/
                          </p>
                        </InputAdornment>
                      )
                    }}
                    helperText={
                      <FormHelperText
                        value={value}
                        name={name}
                        errors={formState.errors}
                      >
                        Discord Invite
                      </FormHelperText>
                    }
                  />
                );
              }}
            />

            <StepperButton label="Create Task" disabled={!formState.isValid} />
          </Stack>
        </Container>
      )}
    </>
  );
};

export default memo(JoinDiscordTasks);
