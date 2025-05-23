"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import BaseButton from "@/components/customs/buttons/BaseButton";
import { GoRocket } from "react-icons/go";
import { newFeatures } from "@/constants/new-features";

interface NewFeatureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NewFeaturesViewProps {
  handleBack: () => void;
  handleNext: () => void;
  onClose: () => void;
  currentStep: number;
  totalSteps: number;
}

export default function NewFeatureModal({
  isOpen,
  onClose,
}: NewFeatureModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = newFeatures.length;

  // Navigate to next step
  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  // Navigate to previous step
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Effect to check if modal should be shown
  useEffect(() => {
    if (isOpen) {
      // You can add any initialization logic here
      document.body.style.overflow = "hidden"; // Prevent scrolling when modal is open
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <NewFeaturesView
          handleBack={handleBack}
          handleNext={handleNext}
          onClose={onClose}
          currentStep={currentStep}
          totalSteps={totalSteps}
        />
      )}
    </AnimatePresence>
  );
}

const NewFeaturesView = ({
  handleBack,
  handleNext,
  onClose,
  currentStep,
  totalSteps,
}: NewFeaturesViewProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const currentFeature = newFeatures[currentStep];

  useEffect(() => {
    setIsLoading(true);
  }, [currentStep]);



  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-black/[12%] backdrop-blur-[3px]"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed left-1/2 top-1/2 z-[300] flex h-auto w-full max-w-[90%] -translate-x-1/2 -translate-y-1/2 flex-col gap-y-7 rounded-[8px] border-2 border-solid border-[#242436] bg-[#080811] pb-4 md:max-w-[700px]"
      >
        {/* Content Container */}
        <div className="w-full h-auto overflow-hidden rounded-t-[6px]">
          {/* Image Container */}
          <div className="relative w-full">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <div className="absolute inset-0 bg-gray-800/40"></div>
                <div className="h-16 w-16 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
              </div>
            )}
            <Image
              src={currentFeature.image}
              alt={currentFeature.title}
              width={700}
              height={400}
              quality={100}
              className={`w-full h-auto transition-opacity duration-300 ${isLoading ? 'opacity-20' : 'opacity-100'}`}
              priority
              onLoadingComplete={() => setIsLoading(false)}
            />
          </div>
        </div>

        <div className="flex w-full flex-col gap-y-4 px-4">
          <div className="w-full pb-4">
            {isLoading ? (
              <>
                <div className="mb-3 mx-auto w-1/2 h-8 bg-gray-700/40 rounded animate-pulse"></div>
                <div className="mx-auto w-full max-w-[500px] space-y-2">
                  <div className="h-4 bg-gray-700/40 rounded animate-pulse"></div>
                  <div className="h-4 w-3/4 mx-auto bg-gray-700/40 rounded animate-pulse"></div>
                </div>
              </>
            ) : (
              <div className="mx-auto text-center w-full max-w-[600px]">
                <h2 className="mb-3 text-center font-geistSemiBold text-[20px] md:text-3xl leading-tight text-fontColorPrimary">
                  {currentFeature.title}
                </h2>
                <p className="text-center text-[16px] md:text-base leading-[20px] text-fontColorSecondary">
                  {currentFeature.description}
                </p>
              </div>
            )}
          </div>

          <div className="border-t border-border" />

          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-2 text-primary">
              <GoRocket size={16} className="sm:text-[20px]" />
              <span className="text-[14px] text-white sm:text-base">
                Nova just Updated!
              </span>
            </div>

            {/* Navigation dots */}
            <div className="hidden space-x-2 py-4 sm:flex">
              {[...Array(totalSteps)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => {}}
                  className={`h-2 w-2 rounded-full ${
                    isLoading ? "bg-gray-700 animate-pulse" : 
                    currentStep === index ? "bg-primary" : "bg-gray-600"
                  }`}
                  aria-label={`Go to step ${index + 1}`}
                />
              ))}
            </div>

            <div className="flex items-center gap-x-2 sm:gap-x-4">
              <BaseButton
                onClick={handleBack}
                variant="gray"
                className={`h-[40px] sm:h-[48px] w-[61px] sm:w-[70px] text-[16px] sm:text-base transition-all duration-200 ${
                  isLoading ? "opacity-50" : "hover:scale-105 active:scale-95 hover:shadow-md"
                }`}
                disabled={currentStep === 0 || isLoading}
              >
                {/* <span
                  className={`inline-block font-geistSemiBold ${currentStep === 0 || isLoading ? "text-gray-500" : "text-fontColorPrimary"}`}
                >
                  Back
                </span> */}
                <span
                  className={`inline-block font-geistSemiBold ${currentStep === 0 ? "text-gray-500" : "text-fontColorPrimary"}`}
                >
                  Back
                </span>
              </BaseButton>
              <BaseButton
                onClick={handleNext}
                variant="primary"
                className={`h-[40px] sm:h-[48px] w-[61px] sm:w-[70px] text-[16px] sm:text-base transition-all duration-200 ${
                  isLoading ? "opacity-50" : "hover:scale-105 active:scale-95 hover:shadow-md"
                }`}
                disabled={isLoading}
              >
                <span className="inline-block font-geistSemiBold text-[#080811]">
                  {currentStep === totalSteps - 1 ? "Finish" : "Next"}
                </span>
              </BaseButton>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};
