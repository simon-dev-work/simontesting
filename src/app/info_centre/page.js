"use client"

import InfoCentreHomePage from "../pages/InfoCentreHomePage";

export default function CleanInfoCentre() {
  return (
    <div className="min-h-screen bg-white">
      <InfoCentreHomePage clean={true} />
    </div>
  );
}
