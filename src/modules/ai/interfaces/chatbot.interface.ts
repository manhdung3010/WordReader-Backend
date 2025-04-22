export interface IChatbot {
  getAnswer(question: string, history?: string[]): Promise<any>;
  saveUploadedFile(file: Express.Multer.File): Promise<string>;
  getLoadedFiles(): Promise<string[]>;
  deleteFile(filename: string): Promise<boolean>;
  deleteAllFiles(): Promise<boolean>;
}
