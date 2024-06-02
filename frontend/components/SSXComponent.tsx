"use client";
import { SSX } from "@spruceid/ssx";
import { ethers } from "ethers";
import { useCallback, useEffect, useState } from "react";

type Design = { label: string; design: string };
type Designs = Design[];

const SSXComponent = ({
  unityProvider,
  provider,
  isLoaded,
  addEventListener,
  removeEventListener,
  sendMessage,
}: {
  unityProvider: any;
  provider:
    | ethers.providers.FallbackProvider
    | ethers.providers.JsonRpcProvider
    | undefined;
  isLoaded: boolean;
  addEventListener: any;
  removeEventListener: any;
  sendMessage: any;
}) => {
  const [ssxProvider, setSsxProvider] = useState<SSX | null>(null);

  const ssxHandler = useCallback(async () => {
    if (ssxProvider) {
      console.log("ssxProvider already available ssxHandler");
      ssxProvider;
    }
    console.log("signing in...");
    const ssx = new SSX({
      providers: {
        // server: {
        //   host: process.env.NEXT_PUBLIC_API_LINK,
        // },
        web3: {
          driver: provider,
        },
      },
      modules: {
        storage: {
          prefix: "my-app",
          hosts: ["https://kepler.spruceid.xyz"],
          autoCreateNewOrbit: true,
        },
        credentials: true,
      },
    });
    await ssx.signIn();
    setSsxProvider(ssx);
    return ssx;
  }, [ssxProvider, provider]);

  const getData = useCallback(async () => {
    let ssx = ssxProvider;
    if (!ssx) {
      console.log("no ssxProvider getData");
      ssx = await ssxHandler();
    }
    let { data } = await ssx.storage.list();
    data = data.filter((d: string) => d.includes("/content/"));
    let datas = new Map();
    for (let i = 0; i < data.length; i++) {
      const contentName = data[i].replace("my-app/", "");
      const { data: data1 } = await ssx.storage.get(contentName);
      const label = contentName.replace("content/", "");
      datas.set(label, data1);
      console.log(`${data1}`);
    }
    console.log("datas: ", datas);
    let formattedData: Designs = [];
    const keys = Array.from(datas.keys());
    for (let i = 0; i < keys.length; i++) {
      formattedData.push({
        label: keys[i],
        design: JSON.parse(datas.get(keys[i])),
      });
    }
    console.log("formattedData: ", formattedData);
    const formattedDataString = JSON.stringify(formattedData);
    console.log("formattedDataString: ", formattedDataString);
    return formattedData;
  }, [ssxProvider, ssxHandler]);

  const getDesigns = useCallback(async () => {
    const data = await getData();
    console.log("getDesigns", JSON.stringify(data));
    sendMessage("CanvasManager", "SetDesigns", JSON.stringify(data));
  }, [getData, sendMessage]);

  const saveDesign = useCallback(
    async (design: string) => {
      let ssx = ssxProvider;
      if (!ssx) {
        console.log("no ssxProvider saveDesign");
        ssx = await ssxHandler();
      }
      const data: Design = JSON.parse(design);
      const label = data.label;
      const designString = JSON.stringify(data.design);
      const contentName = `content/${label}`;
      await ssx.storage.put(contentName, designString);
    },
    [ssxProvider, ssxHandler]
  );

  const ssxLogoutHandler = async () => {
    ssxProvider?.signOut();
    setSsxProvider(null);
  };

  useEffect(() => {
    if (provider) {
      // addEventListener("SignIn", ssxHandler);
      addEventListener("GetDesigns", getDesigns);
      addEventListener("SaveDesign", saveDesign);
    }
    return () => {
      // removeEventListener("SignIn", ssxHandler);
      removeEventListener("GetDesigns", getDesigns);
      removeEventListener("SaveDesign", saveDesign);
    };
  }, [
    addEventListener,
    removeEventListener,
    provider,
    ssxHandler,
    getDesigns,
    saveDesign,
  ]);

  return <></>;
};

export default SSXComponent;
