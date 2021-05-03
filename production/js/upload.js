
function onUploadFileChanged(fileDom, previewId) {

    //判断是否支持FileReader
    if (window.FileReader) {
        reader = new FileReader();
    } else {
        return
    }

    //获取文件
    var file = fileDom.files[0];
    console.log(fileDom)
    var imageType = /^image\//;
    //是否是图片
    if (!imageType.test(file.type)) {
        alert("请选择图片！");
        return;
    }
    //读取完成
    reader.onload = function (e) {
        //获取图片dom
        fileDom.g
        var img = document.getElementById(previewId);
        //图片路径设置为读取的图片
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// **DO THIS**:
//   Replace BUCKET_NAME with the bucket name.
//
var reader;
var albumBucketName = 'sanwa.co.jp';
var credentials = {
    accessKeyId: 'AKIAS3OJ47NC3O3LKMQ2',
    secretAccessKey: 'U/nc/5V/Sv9EwGTeBcrRw4gFbPq/y9xrjivbXMmg'
};

AWS.config.update(credentials);
AWS.config.region = 'ap-northeast-1';
var s3 = new AWS.S3({ params: { Bucket: albumBucketName } });

// A utility function to create HTML.
function getHtml(template) {
    return template.join('\n');
}

// List the photo albums that exist in the bucket.
function listAlbums() {
    console.log("listAlbums -  debug");
    s3.listObjects({ Delimiter: '/' }, function (err, data) {
        if (err) {
            return alert('There was an error listing your albums: ' + err.message);
        } else {
            var albums = data.CommonPrefixes.map(function (commonPrefix) {
                var prefix = commonPrefix.Prefix;
                var albumName = decodeURIComponent(prefix.replace('/', ''));
                return getHtml([
                    '<li>',
                    '<button style="margin:5px;" onclick="viewAlbum(\'' + albumName + '\')">',
                    albumName,
                    '</button>',
                    '</li>'
                ]);
            });
            var message = albums.length ?
                getHtml([
                    '<p>Click on an album name to view it.</p>',
                ]) :
                '<p>You do not have any albums. Please Create album.';
            var htmlTemplate = [
                '<h2>Albums</h2>',
                message,
                '<ul>',
                getHtml(albums),
                '</ul>',
            ]
            document.getElementById('viewer').innerHTML = getHtml(htmlTemplate);
        }
    });
}

// Show the photos that exist in an album.
function viewAlbum(albumName) {
    var albumPhotosKey = encodeURIComponent(albumName) + '/';
    s3.listObjects({ Prefix: albumPhotosKey }, function (err, data) {
        if (err) {
            return alert('There was an error viewing your album: ' + err.message);
        }

        var href = this.request.httpRequest.endpoint.href;
        var bucketUrl = href + albumBucketName + '/';

        var photos = data.Contents.reduce(function(filters, photo) {
            if (photo.Size > 0) {
                var photoKey = photo.Key;
                var photoUrl = bucketUrl + encodeURIComponent(photoKey);
                //console.log("photokey : " + photoKey);
                var photoItem = getHtml([
                    '<div class="warp">',
                    '<div class="warp-content">',
                    '<img id="'+ photoKey+'" src="' + photoUrl + '"/>',
                    '</div>',
                        
                    '<input type="file" id="file_' + photoKey.replace('/', '').replace('.jpg', '') + '" onchange="onUploadFileChanged(this, \'' + photoKey + '\')"/>',
                    '<div class="button-line">',
                    '<button class="btn btn-default" type="button">删除</button>',
                    '<button type="submit" class="btn btn-success" onclick="+ addPhoto(\'' + photoKey + '\')">上传</button>',
                    '</div>',
                    '</div>'
                ]);
                console.log(photoItem)
                filters.push(photoItem)
            }
            return filters;
        }, []);

        var htmlTemplate = [
            '<h2>',
            'Album: ' + albumName,
            '</h2>',
            '<div>',
            getHtml(photos),
            '</div>',
        ]
        document.getElementById('viewer').innerHTML = getHtml(htmlTemplate);
        //document.getElementsByTagName('img')[0].setAttribute('style', 'display:none;');
    });
}


// Show the photos that exist in an album.
function updateImg(albumName) {
    var albumPhotosKey = encodeURIComponent(albumName) + '/';
    var params = {
        Key: "movies_" + dateFormat(new Date(), "yyyymmddHHMMss"),
        Body: JSON.stringify(movies),
        ContentType: "application/json"
      };
    
      var putObjectPromise = s3.putObject(params).promise();
      putObjectPromise.then(function(data) {
        console.log("Successfully uploaded data to " + params.Bucket + "/" + params.Key);
      }).catch(commons.handleError);
}

function addPhoto(photoKey) {
    console.log("addPhoto")
    var file = document.getElementById("file_" + photoKey.replace('/', '').replace('.jpg', '')).files;
    //var files2 = document.getElementById("file").files;
    console.log(file)
    // if (!file.length) {
    //   return alert("Please choose a file to upload first.");
    // }
   
    //var file = files[0];
    //var fileName = file.name;
    //var albumPhotosKey = encodeURIComponent('HomePage') + "/";
  
    //var photoKey = albumPhotosKey + fileName;
  
    // Use S3 ManagedUpload class as it supports multipart uploads
    var upload = new AWS.S3.ManagedUpload({
      params: {
        Bucket: albumBucketName,
        Key: photoKey,
        Body: file[0]
      }
    });
  
    var promise = upload.promise();
  
    promise.then(
      function(data) {
        console.log(data)
        //alert("Successfully uploaded photo.");
        viewAlbum('HomePage');
      },
      function(err) {
        return alert("There was an error uploading your photo: ", err.message);
      }
    );
  }
