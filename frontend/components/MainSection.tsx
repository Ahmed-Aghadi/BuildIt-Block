import { AuthConnectButton } from "@/components/AuthConnectButton";
import UnityPlayer from "./UnityPlayer";

export const MainSection = () => {
  return (
    <div>
      <div className="absolute top-4 right-4">
        <AuthConnectButton />
      </div>
      <UnityPlayer />
    </div>
  );
};
