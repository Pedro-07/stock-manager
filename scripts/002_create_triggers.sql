-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, store_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'store_name', '')
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to update stock when sale is made
CREATE OR REPLACE FUNCTION public.handle_sale_stock_update()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update product stock
  UPDATE public.products 
  SET current_stock = current_stock - NEW.quantity,
      updated_at = NOW()
  WHERE id = NEW.product_id;
  
  -- Create stock movement record
  INSERT INTO public.stock_movements (
    user_id,
    product_id,
    movement_type,
    quantity,
    reason,
    reference_id
  )
  SELECT 
    p.user_id,
    NEW.product_id,
    'out',
    NEW.quantity,
    'Sale',
    NEW.sale_id
  FROM public.products p
  WHERE p.id = NEW.product_id;
  
  RETURN NEW;
END;
$$;

-- Trigger to update stock on sale
DROP TRIGGER IF EXISTS on_sale_item_created ON public.sale_items;
CREATE TRIGGER on_sale_item_created
  AFTER INSERT ON public.sale_items
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_sale_stock_update();

-- Function to update customer total purchases
CREATE OR REPLACE FUNCTION public.update_customer_total()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.customer_id IS NOT NULL THEN
    UPDATE public.customers
    SET total_purchases = (
      SELECT COALESCE(SUM(total_amount), 0)
      FROM public.sales
      WHERE customer_id = NEW.customer_id
    )
    WHERE id = NEW.customer_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger to update customer totals
DROP TRIGGER IF EXISTS on_sale_completed ON public.sales;
CREATE TRIGGER on_sale_completed
  AFTER INSERT OR UPDATE ON public.sales
  FOR EACH ROW
  EXECUTE FUNCTION public.update_customer_total();
