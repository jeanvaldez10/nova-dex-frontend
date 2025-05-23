import React, { Dispatch, SetStateAction } from "react";
import NewlyCreatedList from "../../lists/NewlyCreatedList";
import AboutToGraduateList from "../../lists/AboutToGraduateList";
import GraduatedList from "../../lists/GraduatedList";

export interface CosmoProps {
  isListHoveredNewlyCreated: boolean;
  isListHoveredAboutToGraduate: boolean;
  isListHoveredGraduated: boolean;
  isLoading: boolean;
  setIsListHoveredNewlyCreated: Dispatch<SetStateAction<boolean>>;
  setIsListHoveredAboutToGraduate: Dispatch<SetStateAction<boolean>>;
  setIsListHoveredGraduated: Dispatch<SetStateAction<boolean>>;
}
const CosmoDesktop = ({
  isListHoveredAboutToGraduate,
  isListHoveredGraduated,
  isListHoveredNewlyCreated,
  isLoading,
  setIsListHoveredAboutToGraduate,
  setIsListHoveredGraduated,
  setIsListHoveredNewlyCreated,
}: CosmoProps) => {
  return (
    <div
      className={
        "relative mb-14 h-full w-full flex-grow grid-cols-3 gap-x-5 bg-[#080811] xl:mb-12 xl:grid"
      }
    >
      <NewlyCreatedList
        sizeVariant="desktop"
        isListHovered={isListHoveredNewlyCreated}
        setIsListHovered={setIsListHoveredNewlyCreated}
        isLoading={isLoading}
      />
      <AboutToGraduateList
        sizeVariant="desktop"
        isListHovered={isListHoveredAboutToGraduate}
        setIsListHovered={setIsListHoveredAboutToGraduate}
        isLoading={isLoading}
      />
      <GraduatedList
        sizeVariant="desktop"
        isListHovered={isListHoveredGraduated}
        setIsListHovered={setIsListHoveredGraduated}
        isLoading={isLoading}
      />
    </div>
  );
};

export default React.memo(CosmoDesktop);
