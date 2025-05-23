/* eslint-disable react/no-unescaped-entities */
"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import React, { useState, useCallback, useEffect } from "react";
import cookies from "js-cookie";
// ######## Components 🧩 ########
import Preloader from "@/components/customs/Preloader";
import NewFeatureModal from "./modals/NewFeaturesModal";

interface CosmoClientProps {
  initialIsNewUser: boolean;
}

const CosmoClient = ({ initialIsNewUser }: CosmoClientProps) => {
  const [isPageLoading, setIsPageLoading] = useState<boolean>(true);
  const [isInitialFetchFinished] = useState<boolean>(true);
  const [isNewFeatureModalOpen, setIsNewFeatureModalOpen] =
    useState<boolean>(false);

  // Check localStorage to see if we should show the new features modal
  useEffect(() => {
    if (typeof window !== "undefined") {
      const shouldShowModal =
        localStorage.getItem("show_new_features_modal") === "true";
      if (shouldShowModal) {
        setIsNewFeatureModalOpen(true);
        // Clear the flag so it only shows once after login
        localStorage.removeItem("show_new_features_modal");
      }
    }
  }, []);

  const handleCloseNewFeatureModal = useCallback(() => {
    setIsNewFeatureModalOpen(false);
    // You can set a cookie here to remember that the user has seen the modal
    cookies.set("_has_seen_new_feature_modal", "true", { expires: 30 });
  }, []);

  useEffect(() => {
    setIsPageLoading(false);
  }, [isInitialFetchFinished]);

  return (
    <>
      {initialIsNewUser && (
        <Preloader vanillaCSSAnimation vanillaLoadingState={isPageLoading} />
      )}

      <NewFeatureModal
        isOpen={isNewFeatureModalOpen}
        onClose={handleCloseNewFeatureModal}
      />
    </>
  );
};

export default React.memo(CosmoClient);
