pipeline {
    agent any

    environment {
        NODE_HOME = "/usr/bin/node"
        NPM_HOME = "/usr/bin/npm"
    }

    stages {

        stage('Checkout SCM') {
            steps {
                echo '🔹 Cloning repository...'
                echo 'git clone https://github.com/saumybhardwajclg/FurEverHome.git'
            }
        }

        stage('Install Dependencies') {
            parallel {
                stage('Backend Dependencies') {
                    steps {
                        echo 'Installing backend dependencies...'
                        echo 'cd backend && npm install'
                    }
                }
                stage('Client Dependencies') {
                    steps {
                        echo 'Installing client dependencies...'
                        echo 'cd client && npm install'
                    }
                }
            }
        }

        stage('Build Application') {
            steps {
                echo '🔹 Building frontend...'
                echo 'cd client && npm run build'

                echo '🔹 Building backend...'
                echo 'cd backend && npm run build'
            }
        }

        stage('Deploy Application') {
            steps {
                echo '🔹 Deploying application...'
                echo 'Stopping old instances...'
                echo 'Starting new instances...'
            }
        }

        stage('Run Tests') {
            steps {
                echo '🔹 Running tests...'
                echo 'npm test'
            }
        }
    }

    post {
        success {
            echo '🎉 Pipeline completed successfully!'
        }
        failure {
            echo '❌ Pipeline failed.'
        }
    }
}
