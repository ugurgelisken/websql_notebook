$(document).ready(function() {

    // DIV'LERİ GİZLE
    $("#tabloKontrol").hide();
    $("#kayitDefteri").hide();

    // WEBSQL DESTEKLİYOR MU DİYE BAK
    if (window.openDatabase) {
        // VERİTABANINI OLUŞTUR
        var veritabani = openDatabase('local_veritabani', '1.0', 'Web SQL Veritabanı', 10 * 1024 * 1024);  
        console.log("local_veritabani isimli veritabanı 1.0 versiyonu ile 10MB olacak şekilde oluşturuldu veya zaten varsa yeniden oluşturulmadı!");
        // KAYITLARI ÇEK VE LİSTELE
        kayitlariOku();
    }else{
         alert("Maalesef tarayıcınızda Web SQL desteği bulunmamaktadır.")
    }

    // EVET BUTONUNA TIKLANINCA TABLOYU OLUŞTUR
    $("#tabloOlustur").click(function() {
            veritabani.transaction(function(tx) {
            tx.executeSql('CREATE TABLE notlar(id INTEGER PRIMARY KEY, baslik VARCHAR(128), metin VARCHAR(512), tarih DATETIME )', [], function(islem, sonuc) {
                console.log(sonuc);
                console.log('Notlar tablosu oluşturuldu.');
                // DIV'LERIN GÖRÜNÜRLÜĞÜNÜ DÜZENLE
                $("#tabloKontrol").hide();
                $("#kayitDefteri").show();

            }, function(islem, hata) {
                console.log("Hata: ", hata);
            });
        }, islemHatali, islemBasarili);
    });

    
    // TABLO SİL BUTONUNA TIKLANINCA TABLOYU SİL
    $("#tabloSil").click(function() {
        veritabani.transaction(function(tx) {
            tx.executeSql('DROP TABLE notlar', [], function(islem, sonuc) {
                console.log(sonuc);
                console.log('Notlar tablosu silindi.');
                // DIV'LERIN GÖRÜNÜRLÜĞÜNÜ DÜZENLE
                $("#tabloKontrol").show();
                $("#kayitDefteri").hide();
                // TEKRAR KAYITLARI OKU, BÖYLECE VERİ OLMADIĞI İÇİN TABLO SIFIRLANACAK
                kayitlariOku ();
            }, function(islem, hata) {
                console.log("Hata: ", hata);
            });
        }, islemHatali, islemBasarili);
    });

    // KAYDET BUTONUNA TIKLANINCA YENİ BİR KAYIT GİRİLİYOR
    $("#notKaydet").click(function() {
        veritabani.transaction(function(tx) {

            // JQUERY İLE INPUT DEĞERLERİ ALINIYOR
            var baslik = $("#notBasligi").val();
            var metin = $("#notMetini").val();

            // EĞER İKİ DEĞER DE GİRİLMİŞSE...
            if(baslik && metin){
                // VERİLER GİRİLİYOR.
                tx.executeSql('INSERT INTO notlar (baslik, metin, tarih) VALUES (?,?,?)', [baslik, metin, new Date().getTime()], function(islem, sonuc) {
                    console.log(sonuc);
                    console.log('Notlar tablosu silindi.');
                    // INPUT'LAR SIFIRLANIYOR
                    $("#notBasligi").val("");
                    $("#notMetini").val("");
                    // KAYITLAR TEKRAR OKUNARAK TABLOYA AKTARILIYOR
                    kayitlariOku();
                }, function(islem, hata) {
                    console.log("Hata: ", hata);
                });
            }
        }, islemHatali, islemBasarili);
    });


    // KAYITLARI OKUYAN VE TABLOYU OLUŞTURAN FONKSİYON
    function kayitlariOku (){
        veritabani.transaction(function(tx) {
            tx.executeSql('SELECT * FROM notlar', [], function(islem, sonuc) {
                console.log("Kayıtlar listeleniyor:")
                console.log(sonuc.rows);
                // KAYIT VARSA DIV'LER DÜZENLENİYOR
                $("#tabloKontrol").hide();
                $("#kayitDefteri").show();
                // TABLO SIFIRLANIYOR, SIFIRLANMAZSA PEŞİNE EKLER
                $("#tablo").empty();
                // EACH METODU İLE DÖNGÜYE GİRİLİYOR
                // KAYITLAR sonuc PARAMETRESİNİN rows DEĞERİNDE GELİYOR
                // CONSOLE.LOG()'LARI İNCELEYİN
                // SIRADAKİ HER BİR DEĞER value PARAMETRESİNE ATANIYOR
                jQuery.each(sonuc.rows, function(index, value) {
                    // tablo ID'LI <tbody>'E TEK TEK EKLEME YAPILIYOR.
                     $("#tablo").append(
                        "<tr>" +
                             "<td>"+value.id+"</td>"+
                             "<td><input type='text' id='baslik"+value.id+"' value='"+value.baslik+"' /></td>"+
                             "<td><textarea id='metin"+value.id+"' >"+value.metin+"</textarea></td>"+
                             "<td>"+ new Date(value.tarih).toLocaleString()+"</td>"+
                             "<td><button type='button' data-index='"+value.id+"' class='guncelle btn btn-light'>Güncelle</button>&nbsp&nbsp<button type='button' data-index='"+value.id+"' class='sil btn btn-light' >Sil</button></td>"+
                        "</tr>");
                    // <TR> İLE YENİ SATIR TANIMLANIYOR
                    // <TD> İLE SÜTUN TANIMLANIYOR.
                    // 1. OLARAK BAŞLIK İÇERİĞİ <input> OLUŞTURULARAK ATANIYOR
                    // 2. OLARAK METİN İÇERİĞİ <textarea> OLUŞTURULARAK ATANIYOR
                    // 3. OLARAK TARİH İÇERİĞİ OKUNABİLİR TARİH FORMATINA ÇEVRİLEREK DÜZ METİN OLARAK ATANIYOR
                    // 4. OLARAK DÜZENLE VE SİL BUTONLARI OLUŞTURULUYOR
                    // HER BİRİ İÇİN TANIMLANAN CLASS VE ID METOTLARINI İYİCE İNCELEYİN
                    // ID TANIMLAMALARI DİNAMİK OLARAK INDEX NUMARASINA GÖRE YAPILIYOR
                    // BÖYLECE HANGİSİNİN SİLİNİP GÜNCELLENECEĞİNİ INDEX'TEN ANLAYACAĞIZ
                 });
            }, function(islem, hata) {
                console.log("Tabo Yok")
                console.log("Hata: ", hata);
                $("#tabloKontrol").show();
                $("#kayitDefteri").hide();
            });
        });

    }


    // GÜNCELLE BUTONU DİNAMİK OLUŞTURULDUĞU İÇİN FARKLI BİR METOT İLE TRIGGER EDİYORUZ
    // CLASS İSMİ guncelle OLAN BUTONA TIKLANDIĞINDA
    $(document).on('click','.guncelle',function(){
        // index DEĞERİ data-index'TEN GELİYOR
        // baslik VE metin DEĞELERİ OKUNUYOR.
        // BU OKUMA İŞLEMİNDE index PARAMETRESİNE DİKKAT EDİN.
        // index PARAMETRESİ de this İLE GELİYOR.
        // this DEMEK, TIKLANAN ELEMENTİ TANIMLAR.
        var index = $(this).attr('data-index');
        var baslik = $("#baslik"+index).val();
        var metin = $("#metin"+index).val();
        // EĞER TABLODAKİ INPUT'LARDA VERİLER GİRİLMİŞSE
        // TABLIDA id SUTÜNU İLE index DEĞERİ EŞİT OLAN KAYIT GÜNCELLENİYOR
        if(baslik && metin){
            veritabani.transaction(function(tx) {
                tx.executeSql('UPDATE notlar SET baslik=?, metin=?, tarih=? WHERE id=?', [baslik, metin, new Date().getTime(), index], function(islem, sonuc) {
                    console.log(sonuc);
                    console.log('Kayıt güncellendi.');
                    // GÜNCELLEME SONRASI KAYITLAR TEKRAR OKUNUYOR
                    kayitlariOku();
                }, function(islem, hata) {
                    console.log("Hata: ", hata);
                });
            });
        }
    });

    // CLASS İSMİ sil OLAN BUTONA TIKLANDIĞINDA
    $(document).on('click','.sil',function(){
        // HANGİ ELEMENT TIKLANMIŞSA ONDAKİ data-index'E GÖRE INDEX OKUNUYOR
        var index = $(this).attr('data-index');
        veritabani.transaction(function(tx) {
            // OKUNAN index DEĞERİ İLE VERİTABANINDAKİ id DEĞERİ EŞİT OLAN KAYIT SİLİNİYOR
            tx.executeSql('DELETE FROM notlar WHERE id = ?', [index], function(islem, sonuc) {
                console.log(sonuc);
                console.log('Kayıt silindi.');
                // KAYITLAR TEKRAR GÜNCELLENİYOR
                kayitlariOku();
            }, function(islem, hata) {
                console.log("Hata: ", hata);
            });
        });

    });


    // YUKARIDA GÖRDÜPĞÜNÜZ SORGULARIN BAŞARILI VE BAŞARISIZ DURUMLARINA GÖRE
    // CONSOLE.LOG()'LAR e PARAMETERESİNDEKİ DEĞERLERE GÖRE BASILIYOR.
    function islemHatali(e) {
        console.log("İşlem hatası ! Kod:" + e.code + " Mesaj : " + e.message);
    }

    function islemBasarili() {
        console.log("İşlem başarılı bir şekilde gerçekleştirildi!");
    }

});