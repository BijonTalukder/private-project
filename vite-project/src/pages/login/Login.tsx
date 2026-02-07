import { Button, message } from "antd";
import Form from "../../components/Form/Form";
import { FormCheckbox, FormInput } from "../../components/Form";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { useLoginMutation } from "../../api/services/auth/authApi";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const navigate = useNavigate();
    const [login, { isLoading }] = useLoginMutation();

    const handleLogin = async (data: any) => {
        try {
            const result = await login(data).unwrap();

            console.log(result, "sdffdsfdsfd")

            // Store token if needed
            if (result?.token) {
                localStorage.setItem("token", result.token.accessToken);
            }
            localStorage.setItem("admin", JSON.stringify(result.admin));
            message.success("Login successful!");
            navigate("/"); // Navigate to dashboard or home

        } catch (error: any) {
            message.error(error?.data?.message || "Login failed. Please try again.");
            console.error("Login Error:", error);
        }
    };

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            padding: "20px"
        }}>
            <div style={{
                width: "100%",
                maxWidth: "450px",
                background: "#ffffff",
                borderRadius: "12px",
                boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
                overflow: "hidden",
                border: "1px solid #e0e0e0"
            }}>
                {/* Header Section - Desktop App Style */}
                <div style={{
                    background: "linear-gradient(to right, #4A5568, #2D3748)",
                    padding: "30px 40px",
                    textAlign: "center",
                    borderBottom: "3px solid #667eea"
                }}>
                    <div style={{
                        width: "80px",
                        height: "80px",
                        background: "#667eea",
                        borderRadius: "50%",
                        margin: "0 auto 15px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)"
                    }}>
                        <LockOutlined style={{ fontSize: "36px", color: "#fff" }} />
                    </div>
                    <h2 style={{
                        color: "#fff",
                        margin: 0,
                        fontSize: "24px",
                        fontWeight: "600",
                        letterSpacing: "0.5px"
                    }}>
                        System Login
                    </h2>
                    <p style={{
                        color: "#CBD5E0",
                        margin: "8px 0 0",
                        fontSize: "14px"
                    }}>
                        Enter your credentials to continue
                    </p>
                </div>

                {/* Form Section */}
                <div style={{ padding: "40px" }}>
                    <Form onSubmit={handleLogin}>
                        <FormInput
                            name="email"
                            label="Email Address"
                            placeholder="Enter your email"
                            validation={{
                                required: "Email is required",
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: "Invalid email address"
                                }
                            }}

                        />
                        <UserOutlined style={{ color: "#667eea" }} />
                        <FormInput
                            name="password"
                            type="password"
                            label="Password"
                            placeholder="Enter your password"
                            validation={{
                                required: "Password is required",
                                minLength: {
                                    value: 6,
                                    message: "Password must be at least 6 characters"
                                }
                            }}

                        />
                        <LockOutlined style={{ color: "#667eea" }} />
                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "25px"
                        }}>
                            <FormCheckbox
                                name="rememberMe"
                                label="Remember me"
                            />
                            <a
                                href="/forgot-password"
                                style={{
                                    color: "#667eea",
                                    fontSize: "13px",
                                    textDecoration: "none"
                                }}
                            >
                                Forgot Password?
                            </a>
                        </div>

                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            loading={isLoading}
                            style={{
                                height: "45px",
                                fontSize: "16px",
                                fontWeight: "500",
                                background: "linear-gradient(to right, #667eea, #764ba2)",
                                border: "none",
                                borderRadius: "6px",
                                boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
                                transition: "all 0.3s ease"
                            }}
                        >
                            {isLoading ? "Logging in..." : "Login"}
                        </Button>

                        <div style={{
                            textAlign: "center",
                            marginTop: "25px",
                            paddingTop: "20px",
                            borderTop: "1px solid #E2E8F0"
                        }}>
                            <p style={{
                                color: "#718096",
                                fontSize: "14px",
                                margin: 0
                            }}>
                                Don't have an account?{" "}
                                <a
                                    href="/register"
                                    style={{
                                        color: "#667eea",
                                        fontWeight: "500",
                                        textDecoration: "none"
                                    }}
                                >
                                    Sign up
                                </a>
                            </p>
                        </div>
                    </Form>
                </div>

                {/* Footer - Desktop App Style */}
                <div style={{
                    background: "#F7FAFC",
                    padding: "15px",
                    textAlign: "center",
                    borderTop: "1px solid #E2E8F0"
                }}>
                    <p style={{
                        margin: 0,
                        fontSize: "12px",
                        color: "#A0AEC0"
                    }}>
                        © 2024 Your Company. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;