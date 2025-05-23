import React from 'react'
import CosmoCardLoading from '../loadings/CosmoCardLoading';
import { CosmoDataMessageType } from '@/types/ws-general';
import CosmoCard from './CosmoCard';

const VirtualizedCosmoCard = ({
  isLoading,
  filteredItems,
  sizeVariant,
  index,
}: {
  isLoading: boolean;
  filteredItems: CosmoDataMessageType[];
  sizeVariant: string;
  index: number;
}) => {
  if (isLoading) {
    return <CosmoCardLoading />;
  }

  const item = filteredItems[index];
  return item ? (
    <CosmoCard
      isFirst={index === 0}
      data={item}
      column={sizeVariant === "desktop" ? 1 : 3}
    />
  ) : null;
}

export default VirtualizedCosmoCard