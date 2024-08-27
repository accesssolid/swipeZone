package com.swiperight
import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "SwipeRight"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

        override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(null);
  }
}



// package com.swiperight;

// import android.app.NotificationChannel;
// import android.app.NotificationManager;
// import android.content.ContentResolver;
// import android.media.AudioAttributes;
// import android.net.Uri;
// import android.os.Build;

// import androidx.core.app.NotificationCompat;

// import com.facebook.react.ReactActivity;
// import com.facebook.react.ReactActivityDelegate;
// import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
// import com.facebook.react.defaults.DefaultReactActivityDelegate;
// import android.os.Bundle;

// public class MainActivity extends ReactActivity {

//    @Override
//   protected void onCreate(Bundle savedInstanceState) {
//     if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
//       NotificationChannel notificationChannel = new NotificationChannel("call", "swiperight", NotificationManager.IMPORTANCE_HIGH);
//       notificationChannel.setShowBadge(true);
//       notificationChannel.setDescription("");
//       AudioAttributes att = new AudioAttributes.Builder()
//               .setUsage(AudioAttributes.USAGE_NOTIFICATION)
//               .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
//               .build();
//       notificationChannel.setSound(Uri.parse(ContentResolver.SCHEME_ANDROID_RESOURCE + "://" + getPackageName() + "/raw/calling"), att);
//       notificationChannel.enableVibration(true);
//       notificationChannel.setVibrationPattern(new long[]{400, 400});
//       notificationChannel.setLockscreenVisibility(NotificationCompat.VISIBILITY_PUBLIC);
//       NotificationManager manager = getSystemService(NotificationManager.class);
//       manager.createNotificationChannel(notificationChannel);
//     }
//     super.onCreate(null);
//   }

//   /**
//    * Returns the name of the main component registered from JavaScript. This is used to schedule
//    * rendering of the component.
//    */
//   @Override
//   protected String getMainComponentName() {
//     return "SwipeRight";
//   }

//   /**
//    * Returns the instance of the {@link ReactActivityDelegate}. Here we use a util class {@link
//    * DefaultReactActivityDelegate} which allows you to easily enable Fabric and Concurrent React
//    * (aka React 18) with two boolean flags.
//    */
//   @Override
//   protected ReactActivityDelegate createReactActivityDelegate() {
//     return new DefaultReactActivityDelegate(
//         this,
//         getMainComponentName(),
//         // If you opted-in for the New Architecture, we enable the Fabric Renderer.
//         DefaultNewArchitectureEntryPoint.getFabricEnabled(), // fabricEnabled
//         // If you opted-in for the New Architecture, we enable Concurrent React (i.e. React 18).
//         DefaultNewArchitectureEntryPoint.getConcurrentReactEnabled() // concurrentRootEnabled
//         );
//   }
// }
