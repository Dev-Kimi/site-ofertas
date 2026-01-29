-- Adiciona a coluna author_id na tabela reviews
ALTER TABLE reviews 
ADD COLUMN author_id uuid REFERENCES auth.users(id);

-- Atualiza as políticas de segurança para usar author_id
DROP POLICY IF EXISTS "Permitir insert para autenticados" ON reviews;
CREATE POLICY "Permitir insert para autenticados" 
ON reviews FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = author_id);

-- Permite update apenas para o autor
CREATE POLICY "Permitir update para autor" 
ON reviews FOR UPDATE 
TO authenticated 
USING (auth.uid() = author_id);
