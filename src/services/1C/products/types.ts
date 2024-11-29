export interface OneCGood {
  product_name: string;
  product_art: string;
  product_id: string;
  is_del: boolean;
  product_group_name: string;
  product_group_id: string;
  product_groupmiddle_name: string;
  product_groupmiddle_id: string;
  product_grouplast_name: string;
  product_last_id: string;
  type: string;
  accounting: {
    warehouse: string;
    count: number;
  }[];
  price: number;
  is_published: boolean;
  bestseller: boolean;
  barcode: string[];
}

export interface OneCGoodInfo {
  product_id: string;
  product_name: string;
  description: string;
  files: [
    {
      data: string;
      main: boolean;
      id: string;
    }
  ];
}
