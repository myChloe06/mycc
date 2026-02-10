# 代码安全审查报告

**项目**：{{PROJECT_NAME}}
**仓库地址**：{{REPO_URL}}
**审查时间**：{{REVIEW_DATE}}
**审查人**：cc

---

## 📊 总体评估

**风险等级**：{{RISK_LEVEL}}
**安装建议**：{{INSTALL_ADVICE}}

---

## 🔴 高危问题（必须修复）

{% if HIGH_RISK_ISSUES.length > 0 %}
{{#each HIGH_RISK_ISSUES}}
### {{index}}. {{title}}
**位置**：`{{location}}`
\```{{language}}
{{code}}
\```
**风险**：{{risk}}
**建议**：{{suggestion}}
{{/each}}
{% else %}
✅ 未发现高危问题
{% endif %}

---

## 🟡 中危问题（建议修复）

{% if MEDIUM_RISK_ISSUES.length > 0 %}
{{#each MEDIUM_RISK_ISSUES}}
### {{index}}. {{title}}
**位置**：`{{location}}`
\```{{language}}
{{code}}
\```
**建议**：{{suggestion}}
{{/each}}
{% else %}
✅ 未发现中危问题
{% endif %}

---

## ✅ 通过的检查项

- ✅ 无硬编码敏感信息
- ✅ 文件操作安全
- ✅ 使用 HTTPS 通信
- ✅ 无命令注入风险
- ✅ 依赖来源可信

---

## 📝 审查结论

**安装建议**：{{INSTALL_ADVICE}}

{% if NEED_MODIFICATION %}
**修改清单**：
{{#each MODIFICATIONS}}
{{index}}. {{item}}
{{/each}}

**修改后可重新审查**：让 cc 再次运行 code-review
{% endif %}

---

## 📋 详细检查记录

### 依赖分析
{{DEPENDENCY_ANALYSIS}}

### 网络请求审查
{{NETWORK_REVIEW}}

### 文件操作审查
{{FILE_OPERATION_REVIEW}}

### 命令执行审查
{{COMMAND_EXECUTION_REVIEW}}

---

**审查完成时间**：{{REVIEW_END_TIME}}
