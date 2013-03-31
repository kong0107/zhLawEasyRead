function pic2text(node) {
  var images = node.getElementsByTagName('IMG');
  for(var i = 0; i < images.length; i++) {
    if(images[i].src == 'http://210.69.124.103/ASTAR/100E3722A0C00000040.GIF') {
      images[i].parentNode.replaceChild(document.createTextNode('參'), images[i]);
    }
  }
}
pic2text(document.getElementsByTagName('PRE')[0]);