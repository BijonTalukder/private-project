import { Form, Select, DatePicker, Button, Space, Card } from "antd";
import { SearchOutlined, ReloadOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import type { Client } from "../../../api/services/client/clientApi";

const { RangePicker } = DatePicker;

export interface InvoiceFilters {
    status?: "approved" | "unapproved";
    dateRange?: [Dayjs, Dayjs];
    clientId?: string;
}

interface InvoiceListFiltersProps {
    clients: Client[];
    filters: InvoiceFilters;
    onFilterChange: (filters: InvoiceFilters) => void;
    onReset: () => void;
}

const InvoiceListFilters = ({ clients, filters, onFilterChange, onReset }: InvoiceListFiltersProps) => {
    const [form] = Form.useForm();

    const handleFilterChange = (changedValues: any, allValues: any) => {
        const newFilters: InvoiceFilters = {
            status: allValues.status,
            clientId: allValues.clientId,
            dateRange: allValues.dateRange,
        };
        onFilterChange(newFilters);
    };

    const handleReset = () => {
        form.resetFields();
        onReset();
    };

    return (
        <Card
            style={{
                marginBottom: "20px",
                borderRadius: "8px",
                border: "1px solid #E2E8F0",
            }}
        >
            <Form
                form={form}
                layout="inline"
                onValuesChange={handleFilterChange}
                style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}
            >
                {/* Invoice Type */}
                <Form.Item name="status" style={{ marginBottom: 0, minWidth: "180px" }}>
                    <Select
                        placeholder="Invoice Type"
                        allowClear
                        style={{ width: "100%", height: "40px" }}
                    >
                        <Select.Option value="approved">✓ Approved</Select.Option>
                        <Select.Option value="unapproved">⊘ Unapproved</Select.Option>
                    </Select>
                </Form.Item>

                {/* Date Range */}
                <Form.Item name="dateRange" style={{ marginBottom: 0, minWidth: "280px" }}>
                    <RangePicker
                        placeholder={["From Date", "To Date"]}
                        format="DD MMM YYYY"
                        style={{ width: "100%", height: "40px" }}
                    />
                </Form.Item>

                {/* Client */}
                <Form.Item name="clientId" style={{ marginBottom: 0, minWidth: "200px" }}>
                    <Select
                        placeholder="Select Client"
                        allowClear
                        showSearch
                        optionFilterProp="children"
                        style={{ width: "100%", height: "40px" }}
                    >
                        {clients.map((client) => (
                            <Select.Option key={client._id} value={client._id}>
                                {client.name}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                {/* Action Buttons */}
                <Space style={{ marginLeft: "auto" }}>
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={handleReset}
                        style={{
                            height: "40px",
                            borderRadius: "6px",
                            borderColor: "#667eea",
                            color: "#667eea",
                        }}
                    >
                        Reset
                    </Button>
                </Space>
            </Form>
        </Card>
    );
};

export default InvoiceListFilters;