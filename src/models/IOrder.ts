export interface IOrder {
  line_items: ILineItem[];
  getting_way: string;
  payment_method: string;
  created_via: string;
  customer_note: string;
  billing: IBilling;
  meta_data: IMetaData[];
  shipping_lines: IShippingLine[];
}

export interface IBilling {
  first_name: string;
  last_name: string;
  address_1: string;
  phone: string;
}

export interface ILineItem {
  product_id: string;
  quantity: number;
}

export interface IMetaData {
  key: string;
  value: any;
}

export interface IShippingLine {
  method_id: string;
  method_title: string;
  total: string;
}
