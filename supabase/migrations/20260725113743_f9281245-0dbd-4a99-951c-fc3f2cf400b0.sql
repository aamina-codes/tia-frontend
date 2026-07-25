
-- 1) Lock down user_subscriptions: users may only read their own row.
DROP POLICY IF EXISTS "Users can insert their own subscription" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscription" ON public.user_subscriptions;

REVOKE INSERT, UPDATE, DELETE ON public.user_subscriptions FROM authenticated, anon;
GRANT SELECT ON public.user_subscriptions TO authenticated;
GRANT ALL ON public.user_subscriptions TO service_role;

-- 2) Revoke EXECUTE on SECURITY DEFINER trigger helpers from client roles.
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
