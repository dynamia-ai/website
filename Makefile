.PHONY: md-padding list-md

# Find all Markdown and MDX files in src/content/enterprise-install
MD_FILES := $(shell find src/content/enterprise-install \( -name "*.md" -o -name "*.mdx" \))

# Format all Markdown files in src/content/enterprise-install
md-padding:
	@echo "正在处理 $(words $(MD_FILES)) 个 Markdown 文件..."
	@for file in $(MD_FILES); do \
		echo "处理: $$file"; \
		npx md-padding -i "$$file" || echo "警告: $$file 处理失败"; \
	done
	@echo "✅ 全部处理完成!"

# Show list of files to be processed
list-md:
	@echo "将处理以下 Markdown 文件:"
	@for file in $(MD_FILES); do \
		echo " - $$file"; \
	done
	@echo "总计: $(words $(MD_FILES)) 个文件"
