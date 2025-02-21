class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        // Configuration de la bottom navigation
        val bottomNavigation = findViewById<BottomNavigationView>(R.id.bottom_navigation)
        bottomNavigation.setOnNavigationItemSelectedListener { item ->
            when(item.itemId) {
                R.id.nav_home -> {
                    // Afficher le fragment Home
                    supportFragmentManager.beginTransaction()
                        .replace(R.id.fragment_container, HomeFragment())
                        .commit()
                    true
                }
                R.id.nav_catalog -> {
                    // Afficher le fragment Catalogue
                    supportFragmentManager.beginTransaction()
                        .replace(R.id.fragment_container, CatalogFragment())
                        .commit()
                    true
                }
                R.id.nav_cart -> {
                    // Afficher le fragment Panier
                    supportFragmentManager.beginTransaction()
                        .replace(R.id.fragment_container, CartFragment())
                        .commit()
                    true
                }
                else -> false
            }
        }
    }
} 