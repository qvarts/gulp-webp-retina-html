<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport"
          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Webp images</title>
</head>
<body>
<picture>
<source srcset="/img/test.webp, /img/test@2x.webp 2x" type="image/webp">
<source srcset="/img/test@2x.png 2x" type="image/png">
<img class="test-class" src="/img/test.png" alt="<?php echo 'test'; ?>" />
</picture>
<picture>
<source srcset="/img/test.webp, /img/test@2x.webp 2x" type="image/webp">
<source srcset="/img/test@2x.png 2x" type="image/png">
<img class="test-class" src="/img/test.png" alt="<?= 'test' ?>" />
</picture>
<picture>
<source srcset="/img/test.webp, /img/test@2x.webp 2x" type="image/webp">
<source srcset="/img/test@2x.png 2x" type="image/png">
<img src="/img/test.png" class="<?php echo 'test-class' ?>" alt='<?= "test" ?>' />
</picture>
<picture>
<source srcset="/img/test.webp, /img/test@2x.webp 2x" type="image/webp">
<source srcset="/img/test@2x.png 2x" type="image/png">
<img class="<?php echo 'test-class' ?>" src="/img/test.png" alt='<?= "test" ?>' />
</picture>
<picture>
<source srcset="/img/test.webp, /img/test@2x.webp 2x" type="image/webp">
<source srcset="/img/test@2x.png 2x" type="image/png">
<img class='<?= "test-class"; ?>' src="/img/test.png" alt='<?= "test" ?>' />
</picture>
</body>
</html>