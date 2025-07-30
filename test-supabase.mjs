import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xmtleqquivcukwgdexhc.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtdGxlcXF1aXZjdWt3Z2RleGhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyMjk5OTcsImV4cCI6MjA2ODgwNTk5N30.7_MFUfXszYsh0kFrezS_i5kjcnvMqKJZlhoCEsX58E'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  console.log('🔍 Testando conexão com Supabase...')
  
  try {
    // Testar conexão básica
    const { data: testData, error: testError } = await supabase
      .from('flashcards')
      .select('*')
      .limit(1)
    
    if (testError) {
      console.error('❌ Erro na conexão:', testError)
      return
    }
    
    console.log('✅ Conexão OK!')
    console.log('Dados existentes:', testData)
    
    // Testar inserção básica com autenticação
    console.log('\n🔄 Testando criação de flashcard...')
    
    // Primeiro tentar fazer login ou simular user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.log('⚠️  Usuário não autenticado, testando inserção sem auth...')
      
      // Testar sem user_id (usando service role)
      const testCard = {
        deck_id: '12345678-1234-1234-1234-123456789012', // UUID fictício
        front: 'Teste Front',
        back: 'Teste Back',
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
      
      const { data: insertData, error: insertError } = await supabase
        .from('flashcards')
        .insert(testCard)
        .select()
        .single()
      
      if (insertError) {
        console.error('❌ Erro na inserção:', insertError)
        console.error('Código:', insertError.code)
        console.error('Detalhes:', insertError.details)
        console.error('Hint:', insertError.hint)
        console.error('Message:', insertError.message)
      } else {
        console.log('✅ Flashcard criado com sucesso:', insertData)
        
        // Limpar o teste
        await supabase.from('flashcards').delete().eq('id', insertData.id)
        console.log('🧹 Teste limpo')
      }
    } else {
      console.log('✅ Usuário autenticado:', user.id)
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

testConnection()