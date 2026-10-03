CREATE OR REPLACE FUNCTION soft_delete_child(p_child_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify ownership and then soft delete
  UPDATE children
  SET is_deleted = TRUE,
      updated_at = NOW()
  WHERE id = p_child_id
    AND parent_id = auth.uid();
END;
$$;
