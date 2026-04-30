// Keep in sync with zapfome-backend schema.

export type Tenant = {
  id: string;
  name: string;
  phone: string;
  evolution_instance_id: string | null;
  evolution_api_key: string | null;
  address: string;
  city: string;
  greeting_message: string;
  closed_message: string;
  paused_until: string | null;
  is_active: boolean;
  print_agent_api_key: string;
  created_at: string;
};

export type TenantSettings = {
  id: string;
  tenant_id: string;
  min_order_value: number;
  pickup_time_min: number;
  pickup_time_max: number;
  delivery_time_min: number;
  delivery_time_max: number;
  updated_at: string;
};

export type TenantPayment = {
  id: string;
  tenant_id: string;
  mercadopago_access_token: string | null;
  mercadopago_refresh_token: string | null;
  mercadopago_user_id: number | null;
  mercadopago_token_expires_at: string | null;
  mercadopago_public_key: string | null;
  mercadopago_live_mode: boolean | null;
  mercadopago_scope: string | null;
  mercadopago_connected_at: string | null;
  pix_expiration_minutes: number;
};

export type TenantMenuImage = {
  id: string;
  tenant_id: string;
  image_url: string;
};

export type BusinessHours = {
  id: string;
  tenant_id: string;
  day_of_week: number;
  open_time: string | null;
  close_time: string | null;
  is_closed: boolean;
};

export type MenuItem = {
  id: string;
  tenant_id: string;
  category: string;
  name: string;
  description: string;
  price: number;
  allows_flavors: boolean;
  max_flavors: number;
  is_available: boolean;
  photo_url: string | null;
  created_at: string;
};

export type MenuItemFlavor = {
  id: string;
  tenant_id: string;
  menu_item_id: string;
  name: string;
  price: number | null;
  is_available: boolean;
};

export type MenuItemAddon = {
  id: string;
  tenant_id: string;
  name: string;
  price: number;
  is_available: boolean;
  created_at: string;
};

export type MenuItemAddonLink = {
  menu_item_id: string;
  menu_item_addon_id: string;
};

export type UpsellRule = {
  id: string;
  tenant_id: string;
  suggested_item_id: string;
  message: string;
  is_active: boolean;
};

export type Customer = {
  id: string;
  tenant_id: string;
  phone: string;
  name: string;
  created_at: string;
  updated_at: string;
};

export type CustomerAddress = {
  id: string;
  tenant_id: string;
  customer_id: string;
  address: string | null;
  neighborhood: string | null;
  city: string;
  address_complement: string | null;
  created_at: string;
  updated_at: string;
};

export type DeliveryZone = {
  id: string;
  tenant_id: string;
  neighborhood: string | null;
  city: string;
  fee: number;
  is_active: boolean;
};

export type OrderStatus =
  | "idle"
  | "pending_cart"
  | "pending_address"
  | "confirmed"
  | "awaiting_payment"
  | "pending_delivery_payment"
  | "paid"
  | "preparing"
  | "ready"
  | "out_for_delivery"
  | "done"
  | "payment_expired"
  | "cancelled";

export type DeliveryType = "delivery" | "pickup";

export type PaymentMethod = "pix" | "on_delivery";

export type Order = {
  id: string;
  tenant_id: string;
  customer_id: string;
  order_number: number;
  status: OrderStatus;
  created_at: string;
  confirmed_at: string | null;
  printed_at: string | null;
  forecast_min_minutes: number | null;
  forecast_max_minutes: number | null;
  updated_at: string;
};

export type OrderDeliveryInfo = {
  id: string;
  order_id: string;
  type: DeliveryType;
  delivery_address: string | null;
  delivery_neighborhood: string | null;
  delivery_city: string | null;
  delivery_complement: string | null;
};

export type OrderPayment = {
  id: string;
  order_id: string;
  payment_method: PaymentMethod;
  subtotal: number;
  delivery_fee: number;
  total: number;
  mp_order_id: string | null;
  pix_qr_code: string | null;
  pix_expires_at: string | null;
  paid_at: string | null;
};

export type OrderItem = {
  id: string;
  order_id: string;
  menu_item_id: string;
  quantity: number;
  unit_price: number;
  observation: string | null;
};

export type OrderItemFlavor = {
  id: string;
  order_item_id: string;
  menu_item_flavor_id: string;
  fraction: number;
};

export type OrderItemAddon = {
  id: string;
  order_item_id: string;
  menu_item_addon_id: string;
  quantity: number;
  unit_price: number;
};

export type TenantUser = {
  id: string;
  tenant_id: string;
  user_id: string;
  role: string;
  created_at: string;
};

export type LlmCost = {
  id: string;
  tenant_id: string;
  phone: string;
  order_id: string | null;
  state: string | null;
  calls: number;
  labels: string[];
  total_cost_micro_usd: number;
  created_at: string;
};
