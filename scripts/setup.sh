#!/bin/bash

# Setup script for Crypto Wallet Analyzer
# This script helps initialize the project structure

set -e

echo "🚀 Setting up Crypto Wallet Analyzer..."
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"
echo ""

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please edit .env file and add your API keys"
    echo ""
else
    echo "✅ .env file already exists"
    echo ""
fi

# Create data directories for MongoDB
echo "📁 Creating data directories..."
mkdir -p data/mongodb
echo "✅ Data directories created"
echo ""

# Install backend dependencies (optional - for local development)
read -p "Do you want to install backend dependencies? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📦 Installing backend dependencies..."
    cd backend
    npm install
    cd ..
    echo "✅ Backend dependencies installed"
    echo ""
fi

# Install Python dependencies (optional - for local development)
read -p "Do you want to install Python dependencies? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📦 Installing Python dependencies..."
    cd python-server
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    cd ..
    echo "✅ Python dependencies installed"
    echo ""
fi

# Install frontend dependencies (optional - for local development)
read -p "Do you want to install frontend dependencies? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
    echo "✅ Frontend dependencies installed"
    echo ""
fi

echo "✅ Setup complete!"
echo ""
echo "📖 Next steps:"
echo "  1. Edit .env file and add your API keys (GOLDRUSH_API_KEY, TATUM_API_KEY)"
echo "  2. Run 'docker-compose up -d' to start all services"
echo "  3. Access the application at http://localhost:3000"
echo ""
echo "📚 Documentation:"
echo "  - README.md - Project overview"
echo "  - docs/SETUP.md - Detailed setup instructions"
echo "  - docs/API.md - API documentation"
echo "  - docs/CONTRIBUTION.md - Team contributions"
echo ""
echo "Happy coding! 🎉"
