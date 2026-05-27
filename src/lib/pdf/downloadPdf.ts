import { pdf } from '@react-pdf/renderer';
import type { ReactElement } from 'react';

export const downloadPdf = async (element: ReactElement, filename: string) => {
  const blob = await pdf(element).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};
