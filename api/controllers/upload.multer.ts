import multer from 'multer';
import mkdirp from 'mkdirp';

/**
 * Khởi tạo disk storage cho việc lưu trữ file
 * - Lưu trữ upload file theo user hoặc group
 */
const storage = multer.diskStorage({
  destination(req, file, cb) {
    const now = new Date();
    const userDir = '/content/uploads/' + req.param('user', `${now.getFullYear()}/${now.getMonth()}/${now.getDate()}`);
    const vRequest = req as any;
    const vUploadDir = vRequest.kites.appDirectory + userDir;
    vRequest.uploadDir = userDir;
    mkdirp(vUploadDir, err => {
      cb(null, vUploadDir);
    });
  },
  filename(req, file, cb) {
    cb(null, file.originalname);
  },
});

/**
 * Lưu file buffer trong memory
 */
const uploadMemory = multer({ storage: multer.memoryStorage() });

/**
 * config upload storage
 */
const upload = multer({ storage });

export {
  upload,
  uploadMemory,
};
