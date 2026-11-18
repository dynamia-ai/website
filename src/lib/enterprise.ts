import productsData from '@/data/enterprise-products.json';
import type {EnterpriseProductsFile} from '@/types/enterprise';

const data = productsData as EnterpriseProductsFile;

export function getProductIds(): string[] {
  return data.products.map((p) => p.id);
}
