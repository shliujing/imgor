(function () {
    var m = {}

    m.image = {
        init: function () {
            this.load()
            this.loadYear()
            $('#select-image').change(this.handle)
        },
        loadYear: function () {
            $('#year').text(new Date().getFullYear())
        },
        load: function () {
            var limit = parseInt(window.location.hash.replace('#', '')) || 20
            $.ajax({
                type: 'GET',
                url: '/ajax.php?m=g&limit=' + limit,
                contentType: 'application/json; charset=utf-8',
                success: function (result) {
                    result.reverse()
                    result.map(function (image) {
                        var thumb_url = image.url.replace('sohucs.com/', 'sohucs.com/c_thumb,w_150,h_150/')
                        m.image.show(image.url, thumb_url)
                    })
                }
            })
        },
        handle: function () {
            if (!this.files)
                return alert('选取文件出错！')

            for (var i = 0; i < this.files.length; i++) {
                m.image.upload(this.files[i])
            }
        },
        upload: function (file) {
            if (file.type.indexOf('image') !== 0) {
                return alert('不是图片文件')
            }

            if (file.size > 3e6) {
                return alert('请上传小于3MB大小的图像！')
            }

            m.UP(file, m.image.success, m.image.error, m.image.progress)
        },
        success: function (url) {
            $('#upload-area').text('点击或拖拽上传图片')
            var thumb_url = url.replace('sohucs.com/', 'sohucs.com/c_thumb,w_150,h_150/')
            m.image.show(url, thumb_url)
            m.image.record(url)
        },
        error: function (error) {
            $('#upload-area').text('点击或拖拽上传图片')
            alert('上传失败')
        },
        progress: function (progress) {
            $('#upload-area').text('上传进度：' + parseInt(progress * 100) + '%')
        },
        show: function (url, thumb_url) {
            var html = '<a class="image-link" href="' + url
                + '" target="_blank"><div class="image-show" style="background-image:url('
                + thumb_url + ')"></div></a>'
            $('#show').prepend(html)
        },
        record: function (url) {
            $.ajax({
                type: "POST",
                url: "/ajax.php?m=r",
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify({
                    url: url
                }),
                dataType: "json"
            })
        }
    }

    m.UP = function (file, success, error, upload) {
        var xhr = new XMLHttpRequest()
        xhr.open('POST', 'https://changyan.sohu.com/api/2/comment/attachment?_r=' + Math.random(), 1)

        if (upload)
            xhr.upload.onprogress = function (e) {
                upload(e.loaded / e.total)
            }

        xhr.onload = function (r) {
            r = JSON.parse(eval(xhr.responseText))

            if (r.error_msg && error)
                return error(r.error_msg)

            if (r.url && success)
                return success(r.url.replace('http://', 'https://'))

            if (error) {
                error('unknown error')
            }
        }

        var formData = new FormData()
        formData.append("file", file)

        xhr.send(formData)
    }

    $(function () {
        m.image.init()
    })
})()