import { memo, useEffect, useLayoutEffect, useRef } from "react";
import { useAppDispatch } from "@store/store.model";
import { Init } from "@aut-labs/d-aut";
import { useSelector } from "react-redux";
import {
  NetworksConfig,
  updateWalletProviderState
} from "@store/WalletProvider/WalletProvider";
import { debounce } from "@mui/material";
import { EnvMode, autUrls, environment } from "@api/environment";
import AutSDK from "@aut-labs/sdk";
import { MultiSigner } from "@aut-labs/sdk/dist/models/models";
import { NetworkConfig } from "./network.config";
import { AutWalletConnector, useAutConnector } from "@aut-labs/connector";
import { hubUpdateState } from "@store/Hub/hub.reducer";
import { resetState } from "@store/store";
import { AUTH_TOKEN_KEY } from "@api/auth.api";
import { HubOSAutID } from "@api/aut.model";
import { AppTitle } from "@store/ui-reducer";
import AutLoading from "@components/AutLoading";

function Web3DautConnect({
  setLoading
}: {
  setLoading: (loading: boolean) => void;
}) {
  const dispatch = useAppDispatch();
  const networks = useSelector(NetworksConfig);
  const dAutInitialized = useRef<boolean>(false);

  const {
    isConnected,
    isConnecting,
    connect,
    disconnect,
    setStateChangeCallback,
    connectors,
    multiSigner,
    multiSignerId,
    chainId,
    status,
    address
  } = useAutConnector();

  const onAutInit = async () => {
    const connetectedAlready = localStorage.getItem("aut-data");
    if (!connetectedAlready) {
      setLoading(false);
    }
  };

  const onAutLogin = async ({ detail }: any) => {
    const profile = JSON.parse(JSON.stringify(detail));
    const autID = new HubOSAutID(profile);

    if (autID.properties.network) {
      const selectedNetwork = networks.find(
        (d) =>
          d.network.toLowerCase() ===
          autID.properties.network.network.toLowerCase()
      );
      const itemsToUpdate = {
        sdkInitialized: true,
        selectedNetwork
      };
      await dispatch(updateWalletProviderState(itemsToUpdate));

      await dispatch(
        hubUpdateState({
          autID,
          hubs: autID.properties.hubs,
          selectedHubAddress: autID.properties.hubs[0].properties?.address
        })
      );

      setLoading(false);
    }
  };

  const onDisconnected = async () => {
    dispatch(resetState);
    localStorage.removeItem(AUTH_TOKEN_KEY);
  };

  const onAutMenuProfile = async () => {
    const urls = autUrls();
    const profile = JSON.parse(localStorage.getItem("aut-data"));
    window.open(`${urls.myAut}${profile.name}`, "_blank");
  };

  const initialiseSDK = async (
    network: NetworkConfig,
    multiSigner: MultiSigner
  ) => {
    const sdk = await AutSDK.getInstance(false);
    await sdk.init(multiSigner, {
      hubRegistryAddress: network.contracts.hubRegistryAddress,
      autIDAddress: network.contracts.autIDAddress,
      taskRegistryAddress: network.contracts.taskRegistryAddress
    });
  };

  useEffect(() => {
    const start = async () => {
      let network = networks.find((d) => d.chainId === chainId);
      if (!network) {
        network = networks.filter((d) => !d.disabled)[0];
      }
      await initialiseSDK(network, multiSigner);
      await dispatch(
        updateWalletProviderState({
          selectedNetwork: network
        })
      );
    };
    if (multiSignerId) {
      start();
    }
  }, [multiSignerId]);

  useEffect(() => {
    window.addEventListener("aut_profile", onAutMenuProfile);
    window.addEventListener("aut-Init", onAutInit);
    window.addEventListener("aut-onConnected", onAutLogin);
    window.addEventListener("aut-onDisconnected", onDisconnected);
    if (!dAutInitialized.current && multiSignerId) {
      dAutInitialized.current = true;

      const config: any = {
        defaultText: "Connect Wallet",
        textAlignment: "right",
        menuTextAlignment: "left",
        theme: {
          color: "offWhite",
          type: "main"
        },
        size: {
          width: 240,
          height: 50,
          padding: 3
        }
      };
      Init({
        config,
        envConfig: {
          API_URL: environment.apiUrl,
          GRAPH_API_URL: environment.graphApiUrl,
          IPFS_API_KEY: environment.ipfsApiKey,
          IPFS_API_SECRET: environment.ipfsApiSecret,
          IPFS_GATEWAY_URL: environment.ipfsGatewayUrl,
          ENV: environment.env as EnvMode
        },
        connector: {
          connect,
          disconnect,
          setStateChangeCallback,
          connectors,
          networks,
          state: {
            chainId,
            multiSignerId,
            multiSigner,
            isConnected,
            isConnecting,
            status,
            address
          }
        }
      });
    }

    return () => {
      window.removeEventListener("aut_profile", onAutMenuProfile);
      window.removeEventListener("aut-Init", onAutInit);
      window.removeEventListener("aut-onConnected", onAutLogin);
      window.removeEventListener("aut-onDisconnected", onAutLogin);
    };
  }, [dAutInitialized, multiSignerId]);

  return (
    <>
      <AutWalletConnector
        connect={connect}
        titleContent={
          <AppTitle
            mb={{
              xs: "16px",
              lg: "24px",
              xxl: "32px"
            }}
            variant="h2"
          />
        }
        loadingContent={<AutLoading width="130px" height="130px" />}
      />
      <d-aut
        style={{
          display: "none",
          position: "absolute",
          zIndex: 99999
        }}
        use-dev={environment.env == EnvMode.Development}
        id="d-aut"
        menu-items='[{"name":"Profile","actionType":"event_emit","eventName":"aut_profile"}]'
        flow-config='{"mode" : "signin", "customCongratsMessage": ""}'
        ipfs-gateway={environment.ipfsGatewayUrl}
      />
    </>
  );
}

export const DautPlaceholder = memo(() => {
  const ref = useRef<HTMLDivElement>();
  useLayoutEffect(() => {
    let dautEl: HTMLElement = document.querySelector("#d-aut");
    dautEl.style.display = "none";
    dautEl.style.left = "0";
    dautEl.style.top = "0";
    const updateDautPosition = () => {
      if (!dautEl) {
        dautEl = document.querySelector("#d-aut");
      }
      if (!dautEl || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      dautEl.style.left = `${rect.left}px`;
      dautEl.style.top = `${rect.top}px`;
      dautEl.style.display = "inherit";
    };
    const debounceFn = debounce(updateDautPosition, 10);
    window.addEventListener("resize", debounceFn);
    debounceFn();
    return () => {
      window.removeEventListener("resize", debounceFn);
      dautEl.style.display = "none";
    };
  }, [ref.current]);

  return (
    <div
      ref={ref}
      style={{
        width: "244px",
        height: "55px",
        position: "relative",
        zIndex: -1
      }}
      className="web-component-placeholder"
    />
  );
});

export default Web3DautConnect;
