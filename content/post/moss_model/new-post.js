const NOTICE_TIMEOUT = 4000;

module.exports = async (params) => {
    const { quickAddApi, app } = params;

    // Step 1: 选择目标目录
    const allFolders = app.vault.getAllLoadedFiles()
        .filter(f => f.children && !f.path.includes('/') && !f.path.startsWith('.') && f.path !== 'moss_model')
        .map(f => f.path);

    const folderOptions = ['（无分类）', '（新建分类）', ...allFolders];
    let targetFolder = await quickAddApi.suggester(folderOptions, folderOptions);
    if (!targetFolder) {
        new Notice("已取消：未选择目录", NOTICE_TIMEOUT);
        return;
    }

    let useCategory = true;
    if (targetFolder === '（无分类）') {
        useCategory = false;
    } else if (targetFolder === '（新建分类）') {
        targetFolder = await quickAddApi.inputPrompt("输入新分类名");
        if (!targetFolder || !targetFolder.trim()) {
            new Notice("已取消：未输入分类名", NOTICE_TIMEOUT);
            return;
        }
        targetFolder = targetFolder.trim();
    }

    // Step 2: 输入文章名
    const articleName = await quickAddApi.inputPrompt("输入文章名");
    if (!articleName || !articleName.trim()) {
        new Notice("已取消：未输入文章名", NOTICE_TIMEOUT);
        return;
    }

    const folderPath = useCategory ? `${targetFolder}/${articleName.trim()}` : articleName.trim();
    const filePath = `${folderPath}/index.md`;

    // Step 3: 选择标签
    const existingTags = new Set();
    for (const file of app.vault.getMarkdownFiles()) {
        const cache = app.metadataCache.getFileCache(file);
        const tags = cache?.frontmatter?.tags;
        if (Array.isArray(tags)) {
            tags.forEach(t => { if (t && typeof t === 'string') existingTags.add(t); });
        } else if (tags && typeof tags === 'string') {
            existingTags.add(tags);
        }
    }
    const tags = [];
    let picking = true;
    while (picking) {
        const available = [...existingTags].sort().filter(t => !tags.includes(t));
        const tagOptions = ['（完成选择）', ...(tags.length > 0 ? [] : ['（不添加标签）']), '（新增标签）', ...available];
        const picked = await quickAddApi.suggester(tagOptions, tagOptions);
        if (!picked || picked === '（完成选择）') {
            picking = false;
        } else if (picked === '（不添加标签）') {
            picking = false;
        } else if (picked === '（新增标签）') {
            const newTag = await quickAddApi.inputPrompt("输入新标签名");
            if (newTag && newTag.trim()) {
                tags.push(newTag.trim());
            }
        } else {
            tags.push(picked);
        }
    }
    const tagsYaml = tags.length > 0 ? '\n  - ' + tags.join('\n  - ') : '';

    // Step 4: 检查是否已存在
    if (app.vault.getAbstractFileByPath(filePath)) {
        new Notice("文章已存在！", NOTICE_TIMEOUT);
        return;
    }

    // Step 5: 创建文件夹
    await app.vault.createFolder(folderPath);

    // Step 6: 读取模板并替换占位符
    const templateFile = app.vault.getAbstractFileByPath("moss_model/moss_model.md");
    if (!templateFile) {
        new Notice("模板文件不存在：moss_model/moss_model.md", NOTICE_TIMEOUT);
        return;
    }

    let content = await app.vault.read(templateFile);
    const now = new Date();
    const offset = -now.getTimezoneOffset();
    const sign = offset >= 0 ? '+' : '-';
    const pad = n => String(n).padStart(2, '0');
    const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}${sign}${pad(Math.floor(Math.abs(offset) / 60))}:${pad(Math.abs(offset) % 60)}`;
    const year = now.getFullYear();

    const slugPattern = /^MuvosL-(\d{4})-(\d{3})$/;
    let maxNum = 0;
    for (const file of app.vault.getMarkdownFiles()) {
        const cache = app.metadataCache.getFileCache(file);
        const slug = cache?.frontmatter?.slug;
        if (slug && typeof slug === 'string') {
            const match = slug.match(slugPattern);
            if (match && parseInt(match[1]) === year) {
                maxNum = Math.max(maxNum, parseInt(match[2]));
            }
        }
    }
    const nextSlug = `MuvosL-${year}-${String(maxNum + 1).padStart(3, '0')}`;

    content = content.replace(/\{\{date:.*?\}\}/g, dateStr);
    content = content.replace(/\{\{title\}\}/g, articleName.trim());
    content = content.replace(/\{\{category\}\}/g, useCategory ? targetFolder : '');
    content = content.replace(/\{\{slug\}\}/g, nextSlug);
    content = content.replace(/\{\{tags\}\}/g, tagsYaml);

    // Step 7: 创建文件
    await app.vault.create(filePath, content);

    // Step 8: 打开文件
    const newFile = app.vault.getAbstractFileByPath(filePath);
    await app.workspace.getLeaf(true).openFile(newFile);

    new Notice(`已创建：${filePath}`, NOTICE_TIMEOUT);
};