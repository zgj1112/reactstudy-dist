import React, { useCallback, useMemo } from "react";
import { InboxOutlined } from "@ant-design/icons";
import type { UploadProps } from "antd";
import { Card, message, Upload } from "antd";
import { uploadFile } from "../../api/depts";

const { Dragger } = Upload;

/**
 * 使用统一的 uploadFile API，确保上传逻辑与后端保持一致。
 */
const UploadDemo: React.FC = () => {
  const handleCustomRequest = useCallback(
    async (options: any) => {
      const { file, onSuccess, onError, onProgress } = options;
      try {
        onProgress?.({ percent: 25 });
        await uploadFile(file as File);
        onProgress?.({ percent: 100 });
        onSuccess?.(undefined as never, file as any);
        message.success(`${(file as File).name} 上传成功`);
      } catch (error) {
        message.error(`${(file as File).name} 上传失败`);
        onError?.(error as Error);
      }
    },
    []
  );

  const draggerProps: UploadProps = useMemo(
    () => ({
      name: "file",
      multiple: true,
      customRequest: handleCustomRequest,
      onDrop(e) {
        console.log("Dropped files", e.dataTransfer.files);
      },
    }),
    [handleCustomRequest]
  );

  return (
    <Card
      title="文件上传"
      style={{ maxWidth: 800, margin: "40px auto" }}
    >
      <Dragger {...draggerProps}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">上传</p>
        <p className="ant-upload-hint">拖拽或点击上传文件</p>
      </Dragger>
    </Card>
  );
};

export default UploadDemo;
