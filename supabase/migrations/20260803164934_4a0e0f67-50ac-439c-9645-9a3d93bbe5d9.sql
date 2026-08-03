CREATE POLICY "Users can update their own lab report files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'lab-reports' AND auth.uid()::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'lab-reports' AND auth.uid()::text = (storage.foldername(name))[1]);