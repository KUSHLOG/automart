// Simple validation script to check Prisma client has new models
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

console.log('Checking Prisma client models...')

// Check if new models exist
const hasConversation = 'conversation' in prisma
const hasMessage = 'message' in prisma

console.log('Conversation model exists:', hasConversation)
console.log('Message model exists:', hasMessage)

if (hasConversation && hasMessage) {
  console.log('✅ All messaging models are available!')
} else {
  console.log('❌ Some models are missing')
  console.log(
    'Available models:',
    Object.keys(prisma).filter(key => !key.startsWith('_') && !key.startsWith('$'))
  )
}

prisma.$disconnect()
