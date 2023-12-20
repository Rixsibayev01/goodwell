const TelegramBot = require('node-telegram-bot-api');

// Replace 'YOUR_BOT_TOKEN' with your actual bot token
const token = process.env.BOT_TOKEN;

// Create a bot instance
const bot = new TelegramBot(token, { polling: true, onlyFirstPolling: true });

// Sample product data
const products = [
  { id: 1, name: 'Product A', category: 'Electronics', description: 'Description for Product A' },
  { id: 2, name: 'Product B', category: 'Clothing', description: 'Description for Product B' },
  { id: 3, name: 'Product C', category: 'Books', description: 'Description for Product C' }
];

// Sample categories
const categories = Array.from(new Set(products.map(product => product.category)));

// Listen for the /start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  // Display product categories with an inline keyboard
  const categoryKeyboard = {
    inline_keyboard: categories.map(category => [
      { text: category, callback_data: `category_${category}` }
    ])
  };

  bot.sendMessage(chatId, 'Welcome to the Online Store! Choose a category:', {
    reply_markup: JSON.stringify(categoryKeyboard)
  });
});

// Listen for inline queries
bot.on('inline_query', (query) => {
  const queryText = query.query;

  if (queryText === 'directions') {
    // Answer an inline query with directions about the products
    const directionsArticle = {
      type: 'article',
      id: '1',
      title: 'Directions',
      description: 'Learn how to explore and interact with our products.',
      input_message_content: {
        message_text: 'Here are the directions about our products:\n1. Explore categories using inline keyboards.\n2. Select a product to view details.'
      }
    };

    bot.answerInlineQuery(query.id, [directionsArticle]);
  }
});

// Listen for callback queries (category selection)
bot.on('callback_query', (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;

  if (data.startsWith('category_')) {
    const selectedCategory = data.split('_')[1];

    // Display products in the selected category with an inline keyboard
    const categoryProducts = products.filter(product => product.category === selectedCategory);
    const productKeyboard = {
      inline_keyboard: categoryProducts.map(product => [
        { text: product.name, callback_data: `product_${product.id}` }
      ])
    };

    bot.sendMessage(chatId, `Choose a product in the ${selectedCategory} category:`, {
      reply_markup: JSON.stringify(productKeyboard)
    });
  } else if (data.startsWith('product_')) {
    const productId = parseInt(data.split('_')[1], 10);
    const selectedProduct = products.find(product => product.id === productId);

    if (selectedProduct) {
      // Display product details
      bot.sendMessage(chatId, `${selectedProduct.name}\nCategory: ${selectedProduct.category}\nDescription: ${selectedProduct.description}`);
    }
  }
});

// Listen for the /help command
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;

  // Display help information with an inline keyboard for directions
  const helpKeyboard = {
    inline_keyboard: [
      [{ text: 'Directions', switch_inline_query: 'directions' }]
    ]
  };

  bot.sendMessage(chatId, 'How can I help you?', {
    reply_markup: JSON.stringify(helpKeyboard)
  });
});
