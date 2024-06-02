"use client";
import { useEffect, useRef, useState } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import ENSComponent from "@/components/ENSComponent";
import Progressbar from "@/components/ProgressBar";
import { ContractFunctions } from "./ContractFunctions";

type Design = { label: string; design: string };
type Designs = Design[];

const UnityPlayer = () => {
  const [loaded, setLoaded] = useState(true);
  const canvasRef = useRef(null);

  const {
    unityProvider,
    addEventListener,
    removeEventListener,
    requestFullscreen,
    isLoaded,
    initialisationError,
    sendMessage,
    loadingProgression,
  } = useUnityContext({
    loaderUrl: "Build/Build.loader.js",
    dataUrl: "Build/Build.data",
    frameworkUrl: "Build/Build.framework.js",
    codeUrl: "Build/Build.wasm",
  });

  return (
    <>
      <ContractFunctions
        sendMessage={sendMessage}
        unityProvider={unityProvider}
        isLoaded={isLoaded}
        addEventListener={addEventListener}
        removeEventListener={removeEventListener}
      />
      {!isLoaded && (
        <Progressbar
          bgcolor="orange"
          progress={Math.round(loadingProgression * 100)}
          height={30}
        />
      )}
      <Unity
        unityProvider={unityProvider}
        ref={canvasRef}
        style={{ height: "100dvh", width: "100dvw" }}
        devicePixelRatio={
          typeof window !== "undefined" ? window.devicePixelRatio : 1
        }
      />
      <ENSComponent
        unityProvider={unityProvider}
        isLoaded={isLoaded}
        addEventListener={addEventListener}
        removeEventListener={removeEventListener}
        sendMessage={sendMessage}
      />
    </>
  );
};

export default UnityPlayer;
