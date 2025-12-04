import React, { useCallback, useEffect, useState } from "react";
import {
  Button,
  Card,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Space,
  Table,
} from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { addDept, deleteDept, getDeptPage, updateDept } from "../../api/depts";
import type {
  DeptCreateReqVO,
  DeptRespVO,
  DeptUpdateReqVO,
} from "../../api/depts";

interface DeptPageState {
  pageNum: number;
  pageSize: number;
  total: number;
}

const defaultPageState: DeptPageState = {
  pageNum: 1,
  pageSize: 10,
  total: 0,
};

const ApiTest: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState<DeptRespVO[]>([]);
  const [pagination, setPagination] = useState<DeptPageState>(defaultPageState);
  const [queryForm] = Form.useForm<{ name?: string }>();
  const [modalForm] = Form.useForm<DeptCreateReqVO | DeptUpdateReqVO>();
  const [modalState, setModalState] = useState<{
    visible: boolean;
    editing?: DeptRespVO;
  }>({ visible: false });

  const fetchTableData = useCallback(
    async (page: Partial<DeptPageState> = {}) => {
      const currentPage = {
        pageNum: page.pageNum ?? pagination.pageNum,
        pageSize: page.pageSize ?? pagination.pageSize,
      };
      const queryName = queryForm.getFieldValue("name")?.trim();

      setLoading(true);
      try {
        const resp = await getDeptPage({
          ...currentPage,
          name: queryName || undefined,
        });
        setTableData(resp.list);
        setPagination({
          ...currentPage,
          total: resp.total,
        });
      } catch (error) {
        message.error("查询失败，请稍后重试");
        console.error(error);
      } finally {
        setLoading(false);
      }
    },
    [pagination.pageNum, pagination.pageSize, queryForm]
  );

  useEffect(() => {
    fetchTableData();
  }, [fetchTableData]);

  const handleSearch = async () => {
    await fetchTableData({ pageNum: 1 });
  };

  const handleReset = () => {
    queryForm.resetFields();
    fetchTableData({ pageNum: 1 });
  };

  const openModal = (record?: DeptRespVO) => {
    setModalState({ visible: true, editing: record });
    if (record) {
      modalForm.setFieldsValue({
        id: record.id,
        name: record.name,
        remark: record.remark,
        count: record.count,
      });
    } else {
      modalForm.resetFields();
    }
  };

  const closeModal = () => {
    setModalState({ visible: false });
    modalForm.resetFields();
  };

  const handleModalOk = async () => {
    try {
      const values = await modalForm.validateFields();
      if (modalState.editing) {
        await updateDept(values as DeptUpdateReqVO);
        message.success("更新成功");
      } else {
        await addDept(values as DeptCreateReqVO);
        message.success("新增成功");
      }
      closeModal();
      fetchTableData();
    } catch (error) {
      // validateFields 或请求失败时的错误在各自内部提示
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteDept(id);
      message.success("删除成功");
      const isLastItemOnPage = tableData.length === 1 && pagination.pageNum > 1;
      await fetchTableData({
        pageNum: isLastItemOnPage ? pagination.pageNum - 1 : pagination.pageNum,
      });
    } catch (error) {
      message.error("删除失败，请稍后重试");
    }
  };

  const columns: ColumnsType<DeptRespVO> = [
    {
      title: "部门名称",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "人数",
      dataIndex: "count",
      key: "count",
    },
    {
      title: "备注",
      dataIndex: "remark",
      key: "remark",
    },
    {
      title: "创建时间",
      dataIndex: "createTime",
      key: "createTime",
    },
    {
      title: "更新时间",
      dataIndex: "updateTime",
      key: "updateTime",
    },
    {
      title: "操作",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" onClick={() => openModal(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确认删除该部门？"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="link" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleTableChange = (pager: TablePaginationConfig) => {
    fetchTableData({
      pageNum: pager.current ?? 1,
      pageSize: pager.pageSize ?? 10,
    });
  };

  return (
    <Card
      title="部门管理----(接口报错是因为服务器睡眠状态了，可以联系我哦，开发不易)"
      styles={{
        body: {
          margin: 8,
          maxHeight: "calc(100vh - 200px)",
          overflowY: "auto",
        },
      }}
      style={{
        maxWidth: "70vw",
        margin: "24px auto",
        minHeight: "calc(100vh - 100px)",
      }}
    >
      <Space orientation="vertical" style={{ width: "100%" }} size="large">
        <Form
          form={queryForm}
          layout="inline"
          onFinish={handleSearch}
          style={{ gap: 12 }}
        >
          <Form.Item name="name" label="部门名称">
            <Input placeholder="支持模糊查询" allowClear />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                查询
              </Button>
              <Button onClick={handleReset}>重置</Button>
              <Button type="dashed" onClick={() => openModal()}>
                新增
              </Button>
            </Space>
          </Form.Item>
        </Form>

        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={tableData}
          pagination={{
            current: pagination.pageNum,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
          }}
          onChange={handleTableChange}
        />
      </Space>

      <Modal
        open={modalState.visible}
        title={modalState.editing ? "编辑部门" : "新增部门"}
        onOk={handleModalOk}
        onCancel={closeModal}
        okText="提交"
        cancelText="取消"
      >
        <Form form={modalForm} layout="vertical">
          {modalState.editing && (
            <Form.Item name="id" hidden>
              <Input />
            </Form.Item>
          )}
          <Form.Item
            name="name"
            label="部门名称"
            rules={[{ required: true, message: "请输入部门名称" }]}
          >
            <Input placeholder="请输入部门名称" />
          </Form.Item>
          <Form.Item name="count" label="人数">
            <Input type="number" placeholder="请输入部门人数" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea placeholder="请输入备注" rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default ApiTest;
