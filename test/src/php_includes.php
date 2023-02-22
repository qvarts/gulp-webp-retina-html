<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport"
          content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Webp images</title>
</head>
<body>
<img class="test-class" src="../img/test.png" alt="<?php echo 'test'; ?>" />
<img class="test-class" src="../img/test.png" alt="<?= 'test' ?>" />
<img src="../img/test.png" class="<?php echo 'test-class' ?>" alt='<?= "test" ?>' />
<img class="<?php echo 'test-class' ?>" src="../img/test.png" alt='<?= "test" ?>' />
<img class='<?= "test-class"; ?>' src="../img/test.png" alt='<?= "test" ?>' />
</body>
</html>