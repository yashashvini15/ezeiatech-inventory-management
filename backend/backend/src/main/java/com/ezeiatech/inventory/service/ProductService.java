package com.ezeiatech.inventory.service;

import com.ezeiatech.inventory.dto.CatalogProductResponse;
import com.ezeiatech.inventory.dto.PageResponse;
import com.ezeiatech.inventory.dto.ProductRequest;
import com.ezeiatech.inventory.dto.ProductResponse;
import com.ezeiatech.inventory.entity.Category;
import com.ezeiatech.inventory.entity.Product;
import com.ezeiatech.inventory.entity.ProductStatus;
import com.ezeiatech.inventory.entity.Supplier;
import com.ezeiatech.inventory.exception.ApiException;
import com.ezeiatech.inventory.repository.CategoryRepository;
import com.ezeiatech.inventory.repository.ProductRepository;
import com.ezeiatech.inventory.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.ezeiatech.inventory.util.InputSanitizer;
import com.ezeiatech.inventory.specification.ProductSpecs;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final SupplierRepository supplierRepository;

    @Transactional
    public ProductResponse create(ProductRequest req){
        String sku = normalizeSku(req.getSku());
        if(productRepository.existsBySku(sku)){
            throw new ApiException(HttpStatus.CONFLICT, "SKU already exists");
        }
        Product p = new Product();
        apply(p, req, sku);
        p.setStock(req.getStock());
        p.setStatus(ProductStatus.ACTIVE);
        return ProductResponse.from(productRepository.save(p));
    }

    @Transactional
    public ProductResponse update(Long id, ProductRequest req){
        Product p = find(id);
        String sku = normalizeSku(req.getSku());
        if(productRepository.existsBySkuAndIdNot(sku,id)){
            throw new ApiException(HttpStatus.CONFLICT, "SKU already exists");
        }
        apply(p,req,sku);
        return ProductResponse.from(p);
    }

    @Transactional(readOnly = true)
    public ProductResponse getById(Long id){
        return ProductResponse.from(find(id));
    }

    @Transactional
    public void deactivate(Long id){
        find(id).setStatus(ProductStatus.INACTIVE);
    }

    public PageResponse<ProductResponse> list(int page, int limit, String search, Long categoryId,
                                              ProductStatus status, BigDecimal minPrice, BigDecimal maxPrice,
                                              Boolean lowStock, String sortBy, String direction){
        if(page < 1){
            throw new ApiException(HttpStatus.BAD_REQUEST, "page must be 1 or more");
        }
        if(limit < 1 || limit >100){
            throw new ApiException(HttpStatus.BAD_REQUEST, "limit must be between 1 and 100");
        }
        if(minPrice != null && maxPrice != null && minPrice.compareTo(maxPrice) > 0){
            throw new ApiException(HttpStatus.BAD_REQUEST, "minPrice cannot be greater than maxPrice");
        }

        Pageable pageable = PageRequest.of(page-1,limit,buildSort(sortBy, direction));

        Specification<Product> spec = ProductSpecs.filter(search,categoryId,status,minPrice,maxPrice,lowStock);

        Page<Product> result = productRepository.findAll(spec, pageable);
        return PageResponse.from(result.map(ProductResponse::from));
    }

    @Transactional
    public ProductResponse activate(Long id){
        Product p = find(id);
        p.setStatus(ProductStatus.ACTIVE);
        return ProductResponse.from(p);
    }

    @Transactional(readOnly = true)
    public PageResponse<CatalogProductResponse> catalog(int page, int limit, String search, Long categoryId,
                                                        BigDecimal minPrice, BigDecimal maxPrice,
                                                        String sortBy, String direction) {
        if (page < 1) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "page must be 1 or more");
        }
        if (limit < 1 || limit > 100) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "limit must be between 1 and 100");
        }
        if (minPrice != null && maxPrice != null && minPrice.compareTo(maxPrice) > 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "minPrice cannot be greater than maxPrice");
        }
        Pageable pageable = PageRequest.of(page - 1, limit, buildSort(sortBy, direction));
        // status hamesha ACTIVE (customer se status param nahi lete)
        Specification<Product> spec = ProductSpecs.filter(search, categoryId, ProductStatus.ACTIVE, minPrice, maxPrice, null);
        return PageResponse.from(productRepository.findAll(spec, pageable).map(CatalogProductResponse::from));
    }

    @Transactional(readOnly = true)
    public CatalogProductResponse catalogGet(Long id) {
        Product p = find(id);
        if (p.getStatus() != ProductStatus.ACTIVE) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Product not found");
        }
        return CatalogProductResponse.from(p);
    }

    private Product find(Long id){
        return productRepository.findById(id)
                .orElseThrow(()-> new ApiException(HttpStatus.NOT_FOUND, "Product not found"));
    }

    private void apply(Product p, ProductRequest req, String sku){
        Category category = categoryRepository.findById(req.getCategoryId())
                .orElseThrow(()-> new ApiException(HttpStatus.NOT_FOUND, "Category not found"));

        Supplier supplier = supplierRepository.findById(req.getSupplierId())
                .orElseThrow(()-> new ApiException(HttpStatus.NOT_FOUND, "Supplier not found"));
        p.setName(InputSanitizer.clean(req.getName()));
        p.setSku(sku);
        p.setDescription(InputSanitizer.clean(req.getDescription()));
        p.setCategory(category);
        p.setSupplier(supplier);
        p.setPrice(req.getPrice());
        p.setCostPrice(req.getCostPrice());
        p.setReorderLevel(req.getReorderLevel());
    }

    private Sort buildSort(String sortBy, String direction){
        String field = switch(sortBy == null ? "createdAt" : sortBy){
            case "createdAt" -> "createdAt";
            case "price" -> "price";
            case "name" -> "name";
            case "stock" -> "stock";
            default -> throw new ApiException(HttpStatus.BAD_REQUEST, "sortBy must be one of: createdAt, price, name, stock");
        };

        if(direction != null && !direction.equalsIgnoreCase("asc") &&
        !direction.equalsIgnoreCase("desc")){
            throw new ApiException(HttpStatus.BAD_REQUEST, "direction must be asc or desc");
        }
        Sort.Direction dir = "asc".equalsIgnoreCase(direction) ? Sort.Direction.ASC : Sort.Direction.DESC;

        return Sort.by(dir,field).and(Sort.by(Sort.Direction.ASC, "id"));
    }
    private String normalizeSku(String sku) {
        return InputSanitizer.clean(sku).toUpperCase();
    }
}
