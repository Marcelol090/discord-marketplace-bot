import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "discord_marketplace",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const categories = [
  { name: "🎮 Jogos", description: "Jogos e softwares" },
  { name: "📚 Cursos", description: "Cursos online e treinamentos" },
  { name: "🎨 Design", description: "Recursos de design e templates" },
  { name: "💻 Desenvolvimento", description: "Ferramentas e bibliotecas" },
  { name: "🎵 Música", description: "Músicas e áudios" },
];

const products = [
  {
    categoryId: 1,
    name: "Jogo Premium - Aventura Épica",
    description: "Um jogo de aventura emocionante com gráficos incríveis",
    price: 99.99,
    stock: 50,
    imageUrl: "https://via.placeholder.com/300x200?text=Jogo+Premium",
  },
  {
    categoryId: 1,
    name: "Pacote de Jogos Indie",
    description: "5 jogos indie selecionados",
    price: 49.99,
    stock: 100,
    imageUrl: "https://via.placeholder.com/300x200?text=Pacote+Indie",
  },
  {
    categoryId: 2,
    name: "Curso de React Avançado",
    description: "Aprenda React do zero ao avançado com projetos reais",
    price: 129.99,
    stock: 999,
    imageUrl: "https://via.placeholder.com/300x200?text=React+Course",
  },
  {
    categoryId: 2,
    name: "Masterclass de Web Design",
    description: "Tudo sobre design web moderno e responsivo",
    price: 79.99,
    stock: 500,
    imageUrl: "https://via.placeholder.com/300x200?text=Web+Design",
  },
  {
    categoryId: 3,
    name: "Pack de 1000 Ícones",
    description: "Ícones profissionais em SVG e PNG",
    price: 29.99,
    stock: 200,
    imageUrl: "https://via.placeholder.com/300x200?text=Icons+Pack",
  },
  {
    categoryId: 3,
    name: "Template Figma Premium",
    description: "Template completo para UI/UX design",
    price: 39.99,
    stock: 150,
    imageUrl: "https://via.placeholder.com/300x200?text=Figma+Template",
  },
  {
    categoryId: 4,
    name: "Biblioteca TypeScript Utils",
    description: "Utilitários prontos para usar em seus projetos",
    price: 19.99,
    stock: 999,
    imageUrl: "https://via.placeholder.com/300x200?text=TypeScript",
  },
  {
    categoryId: 4,
    name: "Framework Node.js Completo",
    description: "Framework robusto para APIs REST",
    price: 59.99,
    stock: 300,
    imageUrl: "https://via.placeholder.com/300x200?text=Node+Framework",
  },
  {
    categoryId: 5,
    name: "Pacote de 100 Loops Musicais",
    description: "Loops de alta qualidade para produção musical",
    price: 44.99,
    stock: 100,
    imageUrl: "https://via.placeholder.com/300x200?text=Music+Loops",
  },
  {
    categoryId: 5,
    name: "Efeitos Sonoros Profissionais",
    description: "5000+ efeitos sonoros para seus projetos",
    price: 89.99,
    stock: 50,
    imageUrl: "https://via.placeholder.com/300x200?text=Sound+Effects",
  },
];

async function seedDatabase() {
  const connection = await pool.getConnection();

  try {
    console.log("🌱 Iniciando seed do banco de dados...\n");

    // Inserir categorias
    console.log("📂 Inserindo categorias...");
    for (const category of categories) {
      await connection.execute(
        "INSERT INTO categories (name, description, createdAt, updatedAt) VALUES (?, ?, NOW(), NOW())",
        [category.name, category.description]
      );
      console.log(`✅ Categoria criada: ${category.name}`);
    }

    console.log("\n📦 Inserindo produtos...");
    for (const product of products) {
      await connection.execute(
        "INSERT INTO products (categoryId, name, description, price, stock, imageUrl, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())",
        [
          product.categoryId,
          product.name,
          product.description,
          product.price,
          product.stock,
          product.imageUrl,
        ]
      );
      console.log(`✅ Produto criado: ${product.name}`);
    }

    console.log("\n✨ Seed concluído com sucesso!");
    console.log(`📊 Total: ${categories.length} categorias e ${products.length} produtos`);
  } catch (error) {
    console.error("❌ Erro ao fazer seed:", error);
    throw error;
  } finally {
    await connection.release();
    await pool.end();
  }
}

seedDatabase().catch((error) => {
  console.error("❌ Erro fatal:", error);
  process.exit(1);
});
