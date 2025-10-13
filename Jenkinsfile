pipeline {
    agent any

    environment {
        ANSIBLE_HOST_KEY_CHECKING = 'False'
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/saumybhardwajclg/FurEverHome.git'
            }
        }

        stage('Deploy with Ansible') {
            steps {
                sshagent(['ansible-key']) {
                    sh '''
                      cd ansible
                      ansible-playbook -i inventory.ini playbooks/web.yml
                    '''
                }
            }
        }
    }

    post {
        success {
            echo '✅ Deployment completed successfully!'
        }
        failure {
            echo '❌ Deployment failed.'
        }
    }
}
