import { useState, useMemo, useEffect, useRef, memo } from "react";
import { Typography, Container } from "@mui/material";
import debounce from "lodash.debounce";
import { RootState, useAppDispatch } from "@store/store.model";
import { useSelector } from "react-redux";
import { ResultState } from "@store/result-status";
import LoadingDialog from "@components/LoadingPopup";
import { environment } from "@api/environment";
import { pxToRem } from "@utils/text-size";
import { AutTextField } from "@components/Fields";
import { AutButton } from "@components/buttons";
import { AutHeader } from "@components/AutHeader";
import { addDiscordToAutID } from "@api/aut.api";

const DiscordIntegration = () => {
  const dispatch = useAppDispatch();
  const [discordUrl, setDiscordUrl] = useState("");
  const input = useRef<any>();
  const { status, paCommunity } = useSelector(
    (state: RootState) => state.partner
  );

  const submit = async () => {
    console.log(discordUrl, 'discordUrl');
    dispatch(addDiscordToAutID(discordUrl));
  };

  const debouncedChangeHandler = useMemo(() => {
    const changeHandler = (e) => {
      setDiscordUrl(e.target.value);
    };
    return debounce(changeHandler, 10);
  }, []);

  useEffect(() => {
    return () => debouncedChangeHandler.cancel();
  }, [debouncedChangeHandler]);

  useEffect(() => {
    // if (paCommunity.discordWebhookUrl && input.current) {
    //   // input.current.value = paCommunity.discordWebhookUrl;
    // }
  }, [input, paCommunity]);

  return (
    <Container
      maxWidth="md"
      sx={{
        flexGrow: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <LoadingDialog
        open={status === ResultState.Updating}
        message="Adding webhook..."
      />
      <AutHeader
        title="Your Community life, directly on your Server."
        subtitle={
          <>
            Create Tasks and let your community contribute - directly on
            Discord!
            <br />
            SkillWallet’s Discord Bot is a bridge between Web2 and Web3
            <br />- to track like a wizard, and react like a witch.
          </>
        }
      />
      <AutTextField
        width="360"
        variant="standard"
        autoFocus
        disabled={status === ResultState.Loading}
        focused
        color="primary"
        placeholder="WebHook"
        inputRef={input}
        onChange={debouncedChangeHandler}
        helperText={
          <Typography fontSize={pxToRem(16)} color="white">
            Required Field
          </Typography>
        }
      ></AutTextField>
      <AutButton
        sx={{
          minWidth: pxToRem(325),
          maxWidth: pxToRem(325),
          height: pxToRem(70),
          mt: pxToRem(100),
        }}
        type="submit"
        color="primary"
        variant="outlined"
        disabled={!discordUrl?.length || status === ResultState.Loading}
        onClick={submit}
      >
        Add & Sign
      </AutButton>
    </Container>
  );
};

export default memo(DiscordIntegration);
