const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://xmtleqquivcukwgdexhc.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtdGxlcXF1aXZjdWt3Z2RleGhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyMjk5OTcsImV4cCI6MjA2ODgwNTk5N30.7_MFUfXszXysh0kFrezS_i5kjcnvMqKJZlhoCEsX58E'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testSubFlashcards() {
  console.log('🔍 Testando criação de subflashcards...')
  
  try {
    // 1. Verificar conexão básica
    const { data: connectionTest, error: connectionError } = await supabase
      .from('flashcards')
      .select('count', { count: 'exact', head: true })
    
    if (connectionError) {
      console.error('❌ Erro de conexão:', connectionError)
      return
    }
    
    console.log('✅ Conexão OK! Total de cards:', connectionTest)
    
    // 2. Simular autenticação com um usuário fictício (para testar RLS)
    // Como não temos um usuário real, vamos usar service_role key para teste
    const testUserId = '12345678-1234-1234-1234-123456789012'
    const testDeckId = '87654321-4321-4321-4321-210987654321'
    
    // 3. Criar um flashcard pai
    console.log('\n📝 Criando flashcard pai...')
    const parentCard = {
      user_id: testUserId,
      deck_id: testDeckId,
      front: 'Teste Pai Front',
      back: 'Teste Pai Back',
      parent_id: null,
      level: 0,
      card_order: 0,
      type: 'traditional',
      difficulty_fsrs: 0,
      stability: 0,
      state: 0,
      due: new Date().toISOString(),
      last_review_fsrs: null,
      review_count: 0
    }
    
    const { data: parentData, error: parentError } = await supabase
      .from('flashcards')
      .insert(parentCard)
      .select()
      .single()
    
    if (parentError) {
      console.error('❌ Erro ao criar pai:', parentError)
      console.error('Código:', parentError.code)
      console.error('Detalhes:', parentError.details)
      console.error('Hint:', parentError.hint)
      return
    }
    
    console.log('✅ Flashcard pai criado:', parentData.id)
    
    // 4. Criar um sub-flashcard
    console.log('\n🧩 Criando sub-flashcard...')
    const childCard = {
      user_id: testUserId,
      deck_id: testDeckId,
      front: 'Teste Filho Front',
      back: 'Teste Filho Back',
      parent_id: parentData.id, // Referência para o pai
      level: 1, // Level 1 = child
      card_order: 0,
      type: 'traditional',
      difficulty_fsrs: 0,
      stability: 0,
      state: 0,
      due: new Date().toISOString(),
      last_review_fsrs: null,
      review_count: 0
    }
    
    const { data: childData, error: childError } = await supabase
      .from('flashcards')
      .insert(childCard)
      .select()
      .single()
    
    if (childError) {
      console.error('❌ Erro ao criar sub-flashcard:', childError)
      console.error('Código:', childError.code)
      console.error('Detalhes:', childError.details)
      console.error('Hint:', childError.hint)
    } else {
      console.log('✅ Sub-flashcard criado:', childData.id)
      
      // 5. Atualizar pai com child_ids
      console.log('\n🔗 Atualizando relação pai-filho...')
      const { data: updateData, error: updateError } = await supabase
        .from('flashcards')
        .update({
          child_ids: [childData.id]
        })
        .eq('id', parentData.id)
        .select()
        .single()
      
      if (updateError) {
        console.error('❌ Erro ao atualizar pai:', updateError)
      } else {
        console.log('✅ Pai atualizado com child_ids:', updateData.child_ids)
        
        // 6. Verificar hierarquia
        console.log('\n🔍 Verificando hierarquia...')
        const { data: hierarchyData, error: hierarchyError } = await supabase
          .from('flashcards')
          .select('*')
          .in('id', [parentData.id, childData.id])
          .order('level')
        
        if (hierarchyError) {
          console.error('❌ Erro ao verificar hierarquia:', hierarchyError)
        } else {
          console.log('✅ Hierarquia criada:')
          hierarchyData.forEach(card => {
            console.log(`  Level ${card.level}: ${card.front} (ID: ${card.id})`)
            if (card.parent_id) console.log(`    ↳ Pai: ${card.parent_id}`)
            if (card.child_ids?.length > 0) console.log(`    ↳ Filhos: ${card.child_ids.join(', ')}`)
          })
        }
      }
    }
    
    // 7. Limpeza
    console.log('\n🧹 Limpando dados de teste...')
    if (childData) {
      await supabase.from('flashcards').delete().eq('id', childData.id)
    }
    await supabase.from('flashcards').delete().eq('id', parentData.id)
    console.log('✅ Limpeza concluída')
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

testSubFlashcards()