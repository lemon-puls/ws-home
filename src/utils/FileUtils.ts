import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'

// 压缩图片并返回压缩后的 File 对象
export const compressImage = (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)

    reader.onload = (event: ProgressEvent<FileReader>) => {
      const img = new Image()
      img.src = event.target?.result as string

      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D

        const maxWidth = 1250 // 压缩后的最大宽度
        const maxHeight = 1250 // 压缩后的最大高度
        let width = img.width
        let height = img.height

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width *= ratio
          height *= ratio
        }

        canvas.width = width
        canvas.height = height

        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            const compressedFile = new File([blob as Blob], file.name, {
              type: 'image/jpeg'
            })
            resolve(compressedFile)
          },
          'image/jpeg',
          0.9
        ) // 控制压缩质量，范围为 0 - 1，数值越小质量越差
      }
    }

    reader.onerror = (error) => {
      reject(error)
    }
  })
}

// 调用compressImage方法对图片进行压缩
export const handleImageCompression = (file: File) => {
  compressImage(file)
    .then((compressedFile: File) => {
      // 对压缩后的文件进行处理
      // console.log("压缩后的文件：", compressedFile);
      // 在这里可以将压缩后的文件上传至服务器等操作
    })
    .catch((error) => {
      // console.error("压缩图片出错：", error);
    })
}

// // 使用示例
// const fileInput = document.getElementById("fileInput") as HTMLInputElement;
// fileInput.addEventListener("change", () => {
//   const file = fileInput.files?.[0];
//   if (file) {
//     handleImageCompression(file);
//   }
// });

// 根据图片地址获取 Blob 对象
export const getBlobFromImageUrl = async (imageUrl: string): Promise<Blob> => {
  const response = await fetch(imageUrl)
  const blob = await response.blob()
  return blob
}

// 将 Blob 对象转换为 File 对象
export const getFileByImgUrl = async (imgUrl: string, fileName?: string) => {
  const response = await fetch(imgUrl)
  const blob = await response.blob()
  const myFileName = fileName ? fileName : Date.now().toString()
  const file = new File([blob], myFileName, { type: blob.type })
  return file
}

// 使用示例
// const imageUrl = "https://example.com/image.jpg"; // 图片地址
// const fileName = "image.jpg"; // 文件名
//
// getBlobFromImageUrl(imageUrl)
//   .then((blob: Blob) => {
//     const file = blobToFile(blob, fileName);
//     console.log("创建的 File 对象：", file);
//
//     // 现在你可以对创建的 File 对象进行进一步操作，比如上传至服务器等
//   })
//   .catch((error) => {
//     console.error("获取 Blob 对象出错：", error);
//   });

// 压缩视频并返回压缩后的 File 对象
export const compressVideo = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<File> => {
  try {
    // const baseURL = 'https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/esm'
    // // const baseURL = ''
    // const ffmpeg = new FFmpeg()
    //
    // // 添加日志监听
    // ffmpeg.on('log', ({ message }) => {
    //   // 解析 FFmpeg 输出的进度信息
    //   const progressMatch = message.match(/time=(\d+:\d+:\d+.\d+)/)
    //   if (progressMatch) {
    //     const timeStr = progressMatch[1]
    //     const [hours, minutes, seconds] = timeStr.split(':').map(Number)
    //     const currentTime = hours * 3600 + minutes * 60 + seconds
    //
    //     // 获取视频总时长
    //     const durationMatch = message.match(/Duration: (\d+:\d+:\d+.\d+)/)
    //     if (durationMatch) {
    //       const [dHours, dMinutes, dSeconds] = durationMatch[1].split(':').map(Number)
    //       const totalDuration = dHours * 3600 + dMinutes * 60 + dSeconds
    //
    //       // 计算进度百分比
    //       const progress = Math.round((currentTime / totalDuration) * 100)
    //       onProgress?.(progress)
    //     }
    //   }
    // })
    //
    // console.log('开始加载 FFmpeg...')
    // await ffmpeg.load({
    //   coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    //   wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    //   workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript')
    // })
    // console.log('FFmpeg 加载完成')
    //
    // console.log('开始写入输入文件...')
    // const inputFileName = 'input' + file.name.substring(file.name.lastIndexOf('.'))
    // await ffmpeg.writeFile(inputFileName, await fetchFile(file))
    // console.log('输入文件写入完成')
    //
    // console.log('开始执行压缩命令...')
    // const outputFileName = 'output.mp4'
    // await ffmpeg.exec([
    //   '-i',
    //   inputFileName,
    //   '-vf',
    //   'scale=640:-1', // 调整分辨率
    //   '-b:v',
    //   '1000k', // 比特率
    //   outputFileName
    //
    //   // '-i',
    //   // inputFileName,
    //   // '-c:v',
    //   // 'libx264',
    //   // '-preset',
    //   // 'ultrafast',
    //   // '-crf',
    //   // '28',
    //   // '-c:a',
    //   // 'aac',
    //   // '-b:a',
    //   // '128k',
    //   // '-movflags',
    //   // '+faststart',
    //   // outputFileName
    // ])
    //
    // // await ffmpeg.run(
    // //   '-i', inputFileName,
    // //   '-vf', 'scale=640:-1', // 调整分辨率
    // //   '-b:v', '1000k', // 比特率
    // //   outputFileName
    // // );
    //
    // console.log('压缩命令执行完成')
    //
    // console.log('视频压缩完成, 开始读取输出文件...')
    // // 读取输出文件
    // const data = await ffmpeg.readFile(outputFileName)
    // console.log('输出文件读取完成')
    // const compressedBlob = new Blob([(data as Uint8Array).buffer], { type: 'video/mp4' })
    // const compressedFile = new File([compressedBlob], file.name.replace(/\.[^/.]+$/, '.mp4'), {
    //   type: 'video/mp4'
    // })
    // console.log('压缩后的文件:', compressedFile)
    //
    // // 如果压缩后文件更大,则返回原文件
    // if (compressedFile.size >= file.size) {
    //   console.log('压缩后的文件更大, 开始返回原文件...')
    //   return file
    // }
    // console.log('压缩后的文件更小, 开始返回压缩后的文件...')

    console.log('开始压缩视频...')
    const startTime = Date.now()

    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm'
    // const baseURL = 'http://localhost:5173'
    const ffmpeg = new FFmpeg()
    ffmpeg.on('log', ({ message }) => {
      console.log(message)
    })

    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      workerURL: await toBlobURL(`/ffmpeg-core.worker.js`, 'text/javascript')
    })

    const inputFileName = 'input' + file.name.substring(file.name.lastIndexOf('.'))
    await ffmpeg.writeFile(inputFileName, await fetchFile(file))
    // await ffmpeg.writeFile('input.webm', await fetchFile('https://raw.githubusercontent.com/ffmpegwasm/testdata/master/Big_Buck_Bunny_180_10s.webm'));
    await ffmpeg.exec([
      '-i',
      inputFileName,
      // 使用硬件加速编码器(优先使用 h264_videotoolbox(Mac), h264_qsv(Intel), h264_nvenc(NVIDIA), h264_amf(AMD))
      '-c:v',
      'libx264',
      // 使用最快的编码预设
      '-preset',
      'ultrafast',
      // 降低编码质量以提高速度
      '-crf',
      '30',
      // 减少参考帧数量
      '-refs',
      '2',
      // 使用较快的运动估计算法
      '-me_method',
      'dia',
      // 减少b帧数量
      '-bf',
      '2',
      // 使用较快的子像素运动估计精度
      '-subq',
      '1',
      // 禁用复杂的编码功能
      '-flags',
      '-loop',
      // 使用较快的去块滤波器
      '-deblock',
      '0:0',
      // 降低分辨率到720p
      '-vf',
      'scale=-2:720',
      // 限制帧率
      '-r',
      '30',
      // 音频编码
      '-c:a',
      'aac',
      '-b:a',
      '128k',
      // 快速启动
      '-movflags',
      '+faststart',
      'output.mp4'
    ])

    const data = await ffmpeg.readFile('output.mp4')
    const compressedBlob = new Blob([(data as Uint8Array).buffer], { type: 'video/mp4' })
    const compressedFile = new File([compressedBlob], file.name.replace(/\.[^/.]+$/, '.mp4'), {
      type: 'video/mp4'
    })

    const endTime = Date.now()
    const duration = (endTime - startTime) / 1000 // 转换为秒

    console.log('视频压缩完成!')
    console.log(`压缩耗时: ${duration.toFixed(2)}秒`)
    console.log(`原始大小: ${(file.size / (1024 * 1024)).toFixed(2)} MB`)
    console.log(`压缩后大小: ${(compressedFile.size / (1024 * 1024)).toFixed(2)} MB`)
    console.log(`压缩率: ${((1 - compressedFile.size / file.size) * 100).toFixed(2)}%`)

    return compressedFile
  } catch (error) {
    console.error('视频压缩失败，详细错误:', error)
    throw error
  }
}
