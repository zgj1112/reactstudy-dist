import request from "@utils/request";

/**
 * 部门模块 API 封装，统一管理所有与部门、文件上传相关的接口。
 */
const DEPT_PREFIX = "/depts";
const FILE_PREFIX = "/file";

export type DeptId = number;

/**
 * 后端返回的部门结构。
 */
export interface DeptRespVO {
  id: DeptId;
  name: string;
  count: number;
  remark: string;
  createTime: string;
  updateTime: string;
}

/**
 * 通用分页返回体。
 */
export interface PageResult<T> {
  list: T[];
  total: number;
}

/**
 * 部门分页查询参数。
 */
export interface DeptPageQuery {
  pageNum?: number;
  pageSize?: number;
  name?: string;
}

/**
 * 部门创建/更新通用字段。
 */
interface DeptBasePayload {
  name: string;
  remark?: string;
  count?: number;
}

export type DeptCreateReqVO = DeptBasePayload;

export interface DeptUpdateReqVO extends DeptBasePayload {
  id: DeptId;
}

/**
 * 获取部门分页列表。
 */
export async function getDeptPage(
  params: DeptPageQuery = {}
): Promise<PageResult<DeptRespVO>> {
  const resp = await request.get<PageResult<DeptRespVO>>(
    `${DEPT_PREFIX}/page`,
    { params }
  );
  return resp; // 响应拦截器已经返回了 res.data，所以这里直接返回 resp
}

/**
 * 新增部门。
 */
export async function addDept(data: DeptCreateReqVO): Promise<string> {
  const resp = await request.post<string>(`${DEPT_PREFIX}/add`, data);
  return resp; // 响应拦截器已经返回了 res.data，所以这里直接返回 resp
}

/**
 * 更新部门。
 */
export async function updateDept(data: DeptUpdateReqVO): Promise<string> {
  const resp = await request.put<string>(`${DEPT_PREFIX}/update`, data);
  return resp; // 响应拦截器已经返回了 res.data，所以这里直接返回 resp
}

/**
 * 删除部门。
 */
export async function deleteDept(id: DeptId): Promise<null> {
  const resp = await request.delete<null>(`${DEPT_PREFIX}/delete`, {
    params: { id },
  });
  return resp; // 响应拦截器已经返回了 res.data，所以这里直接返回 resp
}

/**
 * 上传单个文件，可自定义字段名和额外表单项。
 */
export async function uploadFile(
  file: File,
  options?: {
    fieldName?: string;
    extraData?: Record<string, string>;
  }
): Promise<string> {
  const { fieldName = "file", extraData } = options ?? {};
  const formData = new FormData();
  formData.append(fieldName, file);

  if (extraData) {
    Object.entries(extraData).forEach(([key, value]) =>
      formData.append(key, value)
    );
  }

  const resp = await request.post<string>(`${FILE_PREFIX}/upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return resp; // 响应拦截器已经返回了 res.data，所以这里直接返回 resp
}
