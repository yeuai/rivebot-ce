import { Controller, Request, Post } from '@kites/rest';
import { Inject } from '@kites/common';
import { KITES_INSTANCE, KitesInstance } from '@kites/core';

import { upload } from './upload.multer';

/**
 * Upload controller
 */
@Controller('/upload')
export class UploadController {

  constructor(
    @Inject(KITES_INSTANCE)
    private kites: KitesInstance,
  ) {
    this.kites.logger.debug('Init upload controller!');
  }

  /**
   * Hàm lưu file upload
   * @param req e.Request
   */
  @Post('/', upload.single('upload_file'))
  create(@Request() req) {
    const msg = 'upload ok!';
    const filename = req.file.filename;
    const dirname = req.uploadDir;
    this.kites.logger.info(`File recently uploaded: "${filename}", dirname: ${dirname}`);
    return {msg, filename, dirname};
  }

}
