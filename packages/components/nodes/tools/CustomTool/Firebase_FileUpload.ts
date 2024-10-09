import { v4 as uuid } from 'uuid'
import { initializeApp } from 'firebase/app'
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { INode, INodeData, INodeParams } from '../../../src/Interface'
import { getBaseClasses, getCredentialData, getCredentialParam } from '../../../src/utils'

class Firebase_FileUpload implements INode {
    label: string
    name: string
    version: number
    description: string
    type: string
    icon: string
    category: string
    baseClasses: string[]
    inputs: INodeParams[]
    credential: INodeParams
    outputs: INodeOutputsValue[]

    constructor() {
        this.label = 'Firebase File Upload'
        this.name = 'firebaseFileUpload'
        this.version = 1.0
        this.type = 'FirebaseFileUpload'
        this.icon = 'firebase.svg'
        this.category = 'File Operations'
        this.description = 'Upload files to Firebase Storage and get download URLs'
        this.baseClasses = [this.type]
        this.credential = {
            label: 'Connect Credential',
            name: 'credential',
            type: 'credential',
            credentialNames: ['firebaseApi']
        }
        this.inputs = [
            {
                label: 'File Upload',
                name: 'fileUpload',
                type: 'boolean',
                default: true,
                description: 'Allow file upload in the chat'
            },
            {
                label: 'Firebase Storage Bucket',
                name: 'storageBucket',
                type: 'string',
                placeholder: 'your-project-id.appspot.com'
            }
        ]
        this.outputs = [
            {
                label: 'Firebase File Uploader',
                name: 'fileUploader',
                baseClasses: this.baseClasses
            }
        ]
    }

    async init(nodeData: INodeData, _: string, options: ICommonObject): Promise<any> {
        const isFileUploadEnabled = nodeData.inputs?.fileUpload as boolean
        const storageBucket = nodeData.inputs?.storageBucket as string

        const credentialData = await getCredentialData(nodeData.credential ?? '', options)
        const apiKey = getCredentialParam('apiKey', credentialData, nodeData)
        const authDomain = getCredentialParam('authDomain', credentialData, nodeData)
        const projectId = getCredentialParam('projectId', credentialData, nodeData)
        const messagingSenderId = getCredentialParam('messagingSenderId', credentialData, nodeData)
        const appId = getCredentialParam('appId', credentialData, nodeData)

        const firebaseConfig = {
            apiKey,
            authDomain,
            projectId,
            storageBucket,
            messagingSenderId,
            appId
        }

        const app = initializeApp(firebaseConfig)
        const storage = getStorage(app)

        const uploadFile = async (file: File): Promise<string> => {
            const fileId = uuid()
            const storageRef = ref(storage, `uploads/${fileId}_${file.name}`)
            await uploadBytes(storageRef, file)
            const downloadURL = await getDownloadURL(storageRef)
            return downloadURL
        }

        if (isFileUploadEnabled) {
            // This is a placeholder for the actual file upload logic
            // In a real implementation, you'd need to handle file input and upload
            return {
                uploadFile: async (file: File) => {
                    const downloadURL = await uploadFile(file)
                    return `File uploaded successfully. Download link: ${downloadURL}`
                }
            }
        } else {
            return null
        }
    }
}

module.exports = { nodeClass: Firebase_FileUpload }
